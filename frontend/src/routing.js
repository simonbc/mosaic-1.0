import { writable } from 'svelte/store'

import { editing } from '@data/uiStore'

export const currentHandle = writable(undefined)
export const currentSlug = writable(undefined)

export function goto(path) {
  history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function updateRoute() {
  let path = window.location.pathname.replace(/^\/|\/$/g, '') // remove leading and trailing slash
  const segments = path.split('/')

  let handle
  let slug = ''

  if (segments[0].startsWith('@')) {
    if (segments.length === 1) {
      // /@handle
      handle = segments[0].slice(1)
    } else {
      // /@handle/{slug}
      handle = segments[0].slice(1)
      slug = segments[1]

      if (segments.length === 3 && segments[2] === 'edit') {
        editing.set(true)
      }
    }
  } else {
    if (segments.length === 2 && segments[0] === 'draft') {
      // /draft/{slug}
      slug = segments[1]
    }
  }

  currentHandle.set(decodeURIComponent(handle || ''))
  currentSlug.set(decodeURIComponent(slug || ''))
}

export function navigateTo(slug, handle = null) {
  let path
  if (handle) {
    path = `@${encodeURIComponent(handle)}/${encodeURIComponent(slug)}`
  } else {
    path = `draft/${encodeURIComponent(slug)}`
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
