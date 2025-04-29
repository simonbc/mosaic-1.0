import { openDB } from 'idb'

const DB_NAME = 'mosaic-db'
const DB_VERSION = 3

const PAGES_STORE = 'pages'
const REVISIONS_STORE = 'revisions'
const DRAFTS_STORE = 'drafts'

export async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(PAGES_STORE)) {
        db.createObjectStore(PAGES_STORE)
      }
      if (!db.objectStoreNames.contains(REVISIONS_STORE)) {
        db.createObjectStore(REVISIONS_STORE)
      }
      if (!db.objectStoreNames.contains(DRAFTS_STORE)) {
        db.createObjectStore(DRAFTS_STORE)
      }
    },
  })
}

// ---- Pages ----

export async function loadPages() {
  const db = await getDb()
  return (await db.get(PAGES_STORE, 'all')) || {}
}

export async function savePages(pages) {
  const db = await getDb()
  await db.put(PAGES_STORE, pages, 'all')
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

// ---- Drafts ----

export async function loadDrafts() {
  const db = await getDb()
  return (await db.get(DRAFTS_STORE, 'all')) || {}
}

export async function saveDrafts(drafts) {
  const db = await getDb()
  await db.put(DRAFTS_STORE, drafts, 'all')
}
