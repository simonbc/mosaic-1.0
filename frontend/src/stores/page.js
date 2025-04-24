import { writable } from 'svelte/store'
import { openDB } from 'idb'

export function createPageStore(
  pageId,
  { dbName = 'mosaic', storeName = 'pages', debounceMs = 500 } = {}
) {
  const defaultPage = {
    id: pageId,
    title: 'Welcome to Mosaic',
    content: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    published: false,
  }

  const page = writable(defaultPage, (set) => {
    openDB(dbName, 1, {
      upgrade(db) {
        db.createObjectStore(storeName)
      },
    })
      .then((db) => db.get(storeName, pageId))
      .then((stored) => {
        if (stored) set(stored)
        else {
          set(defaultPage)
          openDB(dbName, 1).then((db) => db.put(storeName, defaultPage, pageId))
        }
      })

    return () => {}
  })

  let timeout
  page.subscribe((value) => {
    clearTimeout(timeout)
    timeout = setTimeout(async () => {
      const db = await openDB(dbName, 1)
      value.updatedAt = Date.now()
      db.put(storeName, value, pageId)
    }, debounceMs)
  })

  return page
}
