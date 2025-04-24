import { writable } from 'svelte/store'
import { getDb } from './utils.js'

export function createPageStore(pageId, { debounceMs = 500 } = {}) {
  const defaultPage = {
    id: pageId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    published: false,
  }

  const page = writable(defaultPage, (set) => {
    getDb()
      .then((db) => db.get('pages', pageId))
      .then((stored) => {
        if (stored) {
          set(stored)
        } else {
          set(defaultPage)
          getDb().then((db) => db.put('pages', defaultPage, pageId))
        }
      })

    return () => {}
  })

  let timeout
  page.subscribe((value) => {
    clearTimeout(timeout)
    timeout = setTimeout(async () => {
      const db = await getDb()
      const now = Date.now()
      value.updatedAt = now
      await db.put('pages', value, pageId)
    }, debounceMs)
  })

  return page
}
