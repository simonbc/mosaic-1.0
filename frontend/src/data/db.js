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
const DB_VERSION = 1

const POSTS_STORE = 'posts'
const REVISIONS_STORE = 'revisions'

function createPostsStore(db) {
  const postStore = db.createObjectStore(POSTS_STORE, { keyPath: 'id' })
  postStore.createIndex('slug', 'slug', { unique: true })
}

function createRevisionsStore(db) {
  db.createObjectStore(REVISIONS_STORE, { keyPath: 'id' })
}

function runMigrations() {}

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  async upgrade(db, oldVersion) {
    // posts store migrations
    if (!db.objectStoreNames.contains(POSTS_STORE)) {
      createPostsStore(db)
    } else {
      runMigrations()
    }

    // revisions store migrations
    if (!db.objectStoreNames.contains(REVISIONS_STORE)) {
      createRevisionsStore(db)
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
  try {
    const db = await getDb()
    const tx = db.transaction(REVISIONS_STORE, 'readonly')
    const store = tx.store
    const allRevisions = await store.getAll()
    const revisions = {}
    for (const revision of allRevisions) {
      revisions[revision.id] = revision
    }
    return revisions
  } catch (err) {
    console.error('Failed to load revisions from IndexedDB', err)
    return {}
  }
}

export async function saveRevisions(revisions) {
  try {
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
  } catch (err) {
    console.error('Failed to save revisions to IndexedDB', err)
  }
}

export async function exportData() {
  const posts = await loadPosts()
  const revisions = await loadRevisions()
  return {
    posts,
    revisions,
  }
}

export async function deletePost(id) {
  const db = await dbPromise
  const tx = db.transaction(POSTS_STORE, 'readwrite')
  await tx.store.delete(id)
  await tx.done
}
