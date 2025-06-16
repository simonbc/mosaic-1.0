import { openDB } from 'idb'
import { v4 as uuidv4 } from 'uuid'

function generateSlug(length = 8) {
  const alphabet =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let slug = ''
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  for (let i = 0; i < length; i++) {
    slug += alphabet[array[i] % alphabet.length]
  }
  return slug
}

const DB_NAME = 'mosaic'
const DB_VERSION = 5

const POSTS_STORE = 'posts'
const REVISIONS_STORE = 'revisions'

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  async upgrade(db, oldVersion) {
    if (oldVersion < 5) {
      if (db.objectStoreNames.contains(POSTS_STORE)) {
        // Migrate old posts store to use UUID-based "id" as keyPath
        // 1. Read all existing posts
        const oldStore = db
          .transaction(POSTS_STORE, 'readonly')
          .objectStore(POSTS_STORE)
        const allPosts = await oldStore.getAll()

        // 2. Create temp object store with keyPath "id"
        const tempStoreName = 'posts_v2'
        if (db.objectStoreNames.contains(tempStoreName)) {
          db.deleteObjectStore(tempStoreName)
        }
        const newStore = db.createObjectStore(tempStoreName, { keyPath: 'id' })

        // 3. Copy posts, assign UUID if missing
        for (const post of allPosts) {
          if (!post.id) {
            post.id = uuidv4()
          }

          // Use the IDBObjectStore of the upgrade transaction
          newStore.put(post)
        }

        // 4. Replace original store with new one
        db.deleteObjectStore(POSTS_STORE)
        db.renameObjectStore(tempStoreName, POSTS_STORE)
      } else {
        db.createObjectStore(POSTS_STORE, { keyPath: 'id' })
      }
    }
    if (!db.objectStoreNames.contains(REVISIONS_STORE)) {
      db.createObjectStore(REVISIONS_STORE, { keyPath: 'id' })
    }
  },
  blocked() {
    console.warn('Database upgrade blocked by another open tab.')
  },
})

export async function getDb() {
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
    posts[post.id] = post
  }
  return posts
}

export async function savePosts(posts) {
  const db = await getDb()
  const tx = db.transaction(POSTS_STORE, 'readwrite')
  const store = tx.store
  for (const id in posts) {
    const post = posts[id]

    if (!post.id) {
      post.id = uuidv4()
    }

    if (
      !post.slug ||
      typeof post.slug !== 'string' ||
      post.slug.trim() === ''
    ) {
      post.slug = generateSlug()
    }

    await store.put(post)
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
    if (revision && revision.id) {
      await store.put(revision)
    }
  }
  await tx.done
}

export async function exportData() {
  const posts = await loadPosts()
  const revisions = await loadRevisions()
  return {
    posts,
    revisions,
  }
}
