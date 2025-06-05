import { openDB } from 'idb'

const DB_NAME = 'mosaic-db'
const DB_VERSION = 3

const POSTS_STORE = 'posts'
const REVISIONS_STORE = 'revisions'

export async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(POSTS_STORE)) {
        db.createObjectStore(POSTS_STORE)
      }
      if (!db.objectStoreNames.contains(REVISIONS_STORE)) {
        db.createObjectStore(REVISIONS_STORE)
      }
    },
  })
}

// ---- Posts ----

export async function loadPosts() {
  const db = await getDb()
  return (await db.get(POSTS_STORE, 'all')) || {}
}

export async function savePosts(posts) {
  const db = await getDb()
  await db.put(POSTS_STORE, posts, 'all')
}

// ---- Revisions ----

export async function loadRevisions() {
  const db = await getDb()
  return (await db.get(REVISIONS_STORE, 'all')) || {}
}

export async function saveRevisions(revisions) {
  const db = await getDb()
  await db.put(REVISIONS_STORE, revisions, 'all')
}
