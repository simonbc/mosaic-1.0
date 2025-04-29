import { get } from 'svelte/store'
import { pageData, pages, pagesLoaded } from './pagesStore.js'
import { revisions, revisionsLoaded } from './revisionsStore.js'
import { slugify } from '../routing.js'

/**
 * Create a new page with an initial empty revision.
 * @param {string} title - Title of the page.
 * @param {string} slug - URL-safe slug (must be unique).
 * @returns {string} pageId - The new page's internal ID.
 */
export function createPage(title) {
  const slug = slugify(title)
  const pageId = crypto.randomUUID()
  const revisionId = crypto.randomUUID()
  const timestamp = Date.now()

  const existingPages = Object.values(get(pages))
  const existingSlug = existingPages.find((p) => p.slug === slug)
  if (existingSlug) {
    throw new Error(`Slug "${slug}" already exists.`)
  }

  revisions.update((current) => ({
    ...current,
    [revisionId]: {
      id: revisionId,
      pageId,
      content: '',
      createdAt: timestamp,
    },
  }))

  pages.update((current) => ({
    ...current,
    [pageId]: {
      id: pageId,
      slug,
      title,
      createdAt: timestamp,
      updatedAt: timestamp,
      latestRevisionId: revisionId,
      cursorPosition: 0,
    },
  }))

  return pageId
}

export function updatePage(pageId, { title, content, cursorPosition }) {
  const revId = crypto.randomUUID()
  const timestamp = Date.now()

  const currentPages = get(pages)
  console.log('Current pages:', currentPages)
  revisions.update((current) => ({
    ...current,
    [revId]: {
      id: revId,
      pageId,
      content,
      createdAt: timestamp,
      parentRevisionId: currentPages[pageId]?.latestRevisionId,
    },
  }))

  pages.update((current) => ({
    ...current,
    [pageId]: {
      ...current[pageId],
      title,
      cursorPosition,
      latestRevisionId: revId,
      updatedAt: timestamp,
    },
  }))

  return revId
}

export function findPageIdBySlug(slug) {
  const allPages = get(pages)
  for (const id in allPages) {
    if (allPages[id].slug === slug) {
      return id
    }
  }
  return null
}

export async function waitFor(store) {
  if (get(store)) return

  return new Promise((resolve) => {
    const unsubscribe = store.subscribe((value) => {
      if (value) {
        unsubscribe()
        resolve()
      }
    })
  })
}

export async function loadPage(slug) {
  if (!slug) {
    pageData.set(null)
    return pageData
  }

  await Promise.all([waitFor(pagesLoaded), waitFor(revisionsLoaded)])

  const allPages = get(pages)
  const allRevisions = get(revisions)

  const pageId = findPageIdBySlug(slug)
  if (!pageId) {
    pageData.set(null)
    return pageData
  }

  const page = allPages[pageId]
  const revision = allRevisions[page.latestRevisionId]

  if (!page || !revision) {
    pageData.set(null)
    return pageData
  }

  pageData.set({
    page,
    revision,
    revisions: Object.values(allRevisions)
      .filter((r) => r.pageId === pageId)
      .sort((a, b) => b.createdAt - a.createdAt),
  })

  return pageData
}
