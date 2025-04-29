import { writable } from 'svelte/store'

// Reactive slug store
export const currentSlug = writable('')

// Update slug based on URL
export function updateRoute() {
  const path = window.location.pathname.slice(1) // remove leading slash
  currentSlug.set(decodeURIComponent(path || ''))
}

// Navigate to a different slug
export function navigateTo(slug) {
  history.pushState({}, '', `/${encodeURIComponent(slug)}`)
  updateRoute()
}

// Setup listener (optional helper if you want central control)
export function startRouting() {
  updateRoute()
  window.addEventListener('popstate', updateRoute)
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
