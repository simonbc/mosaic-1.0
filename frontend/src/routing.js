import { writable } from 'svelte/store'

import { editing, responding } from '@data/uiStore'

export const currentSlug = writable('')

export function updateRoute() {
  let path = window.location.pathname.slice(1) // remove leading slash
  const segments = path.split('/')

  if (segments.length === 2 && segments[1] === 'edit') {
    path = segments[0]
    editing.set(true)
  } else if (segments.length === 3 && segments[2] === 'respond') {
    path = segments[1]
    responding.set(true)
  }

  currentSlug.set(decodeURIComponent(path || ''))
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
