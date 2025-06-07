import { writable } from 'svelte/store'

import { editing, responding } from '@data/uiStore'

export const currentSlug = writable('')

export function updateRoute() {
  let path = window.location.pathname.slice(1) // remove leading slash
  const segments = path.split('/')

  editing.set(false)
  responding.set(false)

  let slug = ''
  if (segments.length === 1) {
    // /{slug}
    slug = segments[0]
  } else if (segments.length === 2) {
    // /{handle}/{slug}
    slug = segments[1]
  } else if (segments.length === 3) {
    // /{handle}/{slug}/edit or /respond
    slug = segments[1]
    if (segments[2] === 'edit') {
      editing.set(true)
    } else if (segments[2] === 'respond') {
      responding.set(true)
    }
  }

  currentSlug.set(decodeURIComponent(slug || ''))
}

export function navigateTo(slug, handle = null) {
  let path = encodeURIComponent(slug)
  if (handle) {
    path = `@${encodeURIComponent(handle)}/${path}`
  }
  history.pushState({}, '', `/${path}`)
  updateRoute()
}

export function startRouting() {
  if (typeof window !== 'undefined') {
    updateRoute()
    window.addEventListener('popstate', updateRoute)
  }
}

export function stopRouting() {
  window.removeEventListener('popstate', updateRoute)
}

export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumerics with hyphens
    .replace(/(^-|-$)+/g, '') // trim starting/ending hyphens
}

export function deslugify(slug) {
  if (!slug) return ''

  const spaced = slug.replace(/-/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}
