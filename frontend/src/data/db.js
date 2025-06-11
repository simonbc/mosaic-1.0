import { openDB } from 'idb'

const DB_NAME = 'mosaic'
const DB_VERSION = 4

const POSTS_STORE = 'posts'
const REVISIONS_STORE = 'revisions'

let dbPromise = null

export async function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
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
  return dbPromise
}

// ---- Posts ----

export async function loadPosts() {
  const db = await getDb()
  const tx = db.transaction(POSTS_STORE, 'readonly')
  const store = tx.store
  const allPosts = await store.getAll()
  const posts = {}
  for (const post of allPosts) {
    posts[post.slug] = post
  }
  return posts
}

export async function savePosts(posts) {
  const db = await getDb()
  const tx = db.transaction(POSTS_STORE, 'readwrite')
  const store = tx.store
  for (const slug in posts) {
    const post = posts[slug]
    if (post?.slug != null) {
      await store.put(post, post.slug)
    }
  }
  await tx.done
}

// ---- Revisions ----

export async function loadRevisions() {
  const db = await getDb()
  const tx = db.transaction(REVISIONS_STORE, 'readonly')
  const store = tx.store
  const allRevisions = await store.getAll()
  const revisions = {}
  for (const revision of allRevisions) {
    revisions[revision.id] = revision
  }
  return revisions
}

export async function saveRevisions(revisions) {
  const db = await getDb()
  const tx = db.transaction(REVISIONS_STORE, 'readwrite')
  const store = tx.store
  for (const id in revisions) {
    const revision = revisions[id]
    if (revision?.id != null) {
      await store.put(revision, revision.id)
    }
  }
  await tx.done
}
