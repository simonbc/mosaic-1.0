import { get, writable } from 'svelte/store'

import {
  getOrCreateKeyPair,
  signHandle,
  exportPublicKeyHex,
} from '@utils/crypto.js'
import { loadPosts, savePosts, loadRevisions, saveRevisions } from './db.js'
import { apiFetch } from '@utils/fetch.js'

export const currentPost = writable(undefined)
export const posts = writable(undefined)
export const revisions = writable(undefined)

// load posts from IndexedDB
loadPosts().then((savedPosts) => {
  posts.set(savedPosts ?? {})
})

// persist posts to IndexedDB on any change
posts.subscribe((currentPosts) => {
  savePosts(currentPosts)
})

// load revisions from IndexedDB
loadRevisions().then((savedRevisions) => {
  revisions.set(savedRevisions ?? {})
})

// persist revisions to IndexedDB on any change
revisions.subscribe((currentRevisions) => {
  saveRevisions(currentRevisions)
})

export function createPost({
  content = '',
  parentId = null,
  cursorPosition = null,
  slug = null,
}) {
  if (!slug) {
    slug = crypto.randomUUID()
  }

  const revisionId = crypto.randomUUID()
  const timestamp = Date.now()

  const post = {
    slug,
    cursorPosition,
    published: false,
    parentId,
  }

  const revision = {
    content,
    published: false,
  }

  revisions.update((current) => ({
    ...current,
    [revisionId]: {
      ...revision,
      id: revisionId,
      postId: slug,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  }))

  posts.update((current) => ({
    ...current,
    [slug]: {
      ...post,
      id: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      latestRevisionId: revisionId,
    },
  }))

  return slug
}

export function updatePost(postId, { content, cursorPosition }) {
  const revId = crypto.randomUUID()
  const timestamp = Date.now()

  const currentPosts = get(posts)

  if (!currentPosts[postId]) {
    throw new Error(`Post with slug ${postId} not found.`)
  }

  revisions.update((current) => ({
    ...current,
    [revId]: {
      id: revId,
      postId,
      content,
      createdAt: timestamp,
      parentRevisionId: currentPosts[postId]?.latestRevisionId,
    },
  }))

  posts.update((current) => ({
    ...current,
    [postId]: {
      ...current[postId],
      cursorPosition,
      latestRevisionId: revId,
      updatedAt: timestamp,
    },
  }))

  return revId
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

export async function loadPost(slug) {
  if (!slug) {
    currentPost.set(null)
    return currentPost
  }

  await Promise.all([waitFor(posts), waitFor(revisions)])

  const allPosts = get(posts)
  const post = allPosts[slug] ?? null
  if (!post) {
    currentPost.set(null)
    return currentPost
  }

  const allRevisions = get(revisions)
  const revision = allRevisions[post.latestRevisionId] ?? null
  if (!revision) {
    currentPost.set(null)
    return currentPost
  }

  const { responses = [] } = post.id ? await fetchPost(post.id) : {}
  const parent = post.parentId ? await fetchPost(post.parentId) : null

  currentPost.set({
    post,
    revision,
    parent,
    revisions: Object.values(allRevisions)
      .filter((r) => r.postId === post.id)
      .sort((a, b) => b.createdAt - a.createdAt),
    responses,
  })

  return currentPost
}

export async function fetchPost(postId) {
  if (!postId) return null
  try {
    return await apiFetch(`/api/post/${postId}`)
  } catch (err) {
    console.error('Failed to fetch post:', err)
    return null
  }
}

export async function fetchPublicPost(handle, slug) {
  if (!handle || !slug) return null
  try {
    return await apiFetch(`/api/post/${handle}/${slug}`)
  } catch (err) {
    console.error('Failed to fetch post:', err)
    return null
  }
}

export async function deletePost(postId) {
  posts.update((current) => {
    const updated = { ...current }
    delete updated[postId]
    return updated
  })

  revisions.update((current) => {
    const updated = { ...current }
    for (const revId in updated) {
      if (updated[revId].postId === postId) {
        delete updated[revId]
      }
    }
    return updated
  })
}

export async function publishPost(post, revision) {
  const { privateKeyJwk, publicKeyJwk } = await getOrCreateKeyPair()

  const publicHex = await exportPublicKeyHex(publicKeyJwk)
  const signature = await signHandle(post.handle, privateKeyJwk)

  const body = JSON.stringify({
    handle: post.handle,
    slug: post.slug,
    content: revision.content,
    created_at: post.createdAt,
    updated_at: Date.now(),
    byline: post.byline,
    parent_id: post.parentId,
    signature,
    public_key: publicHex,
  })

  try {
    const { id } = await apiFetch(`/api/post/${post.handle}/${post.slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })

    posts.update((current) => ({
      ...current,
      [post.slug]: {
        ...current[post.slug],
        id,
        handle: post.handle,
        byline: post.byline,
        published: true,
      },
    }))

    revisions.update((current) => ({
      ...current,
      [revision.id]: {
        ...current[revision.id],
        published: true,
      },
    }))

    await loadPost(post.slug)
  } catch (err) {
    alert('Failed to publish post')
    console.error(err)
  }
}
