import { writable } from 'svelte/store'
import { loadPages, savePages } from './db.js'

export const pageData = writable(null)
export const pages = writable({})
export const pagesLoaded = writable(false)

loadPages().then((savedPages) => {
  console.log('Loaded pages from IndexedDB:', savedPages)
  pages.set(savedPages)
  pagesLoaded.set(true)
})

pages.subscribe((currentPages) => {
  savePages(currentPages)
})
