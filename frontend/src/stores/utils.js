import { openDB } from 'idb'

export function getDb() {
  return openDB('mosaic', 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('pages')) {
        db.createObjectStore('pages')
      }
      if (!db.objectStoreNames.contains('revisions')) {
        const store = db.createObjectStore('revisions', { keyPath: 'revId' })
        store.createIndex('byPage', 'pageId')
      }
    },
  })
}
