import { writable } from 'svelte/store'
import { openDB } from 'idb'

export function createPageStore(
  pageId,
  { dbName = 'mosaic', storeName = 'page', debounceMs = 500 } = {}
) {
  const store = writable('', (set) => {
    let db

    openDB(dbName, 1, {
      upgrade(db) {
        db.createObjectStore(storeName)
      },
    })
      .then((d) => {
        db = d
        return db.get(storeName, pageId)
      })
      .then((saved) => {
        set(saved || '')
      })
    return () => {}
  })

  let timeout
  store.subscribe((value) => {
    if (!value || !pageId) return
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      openDB(dbName, 1).then((db) => db.put(storeName, value, pageId))
    }, debounceMs)
  })

  return store
}
