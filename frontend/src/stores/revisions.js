import { writable } from 'svelte/store'
import { getDb } from './utils.js'

const STORE_NAME = 'revisions'
const latestRevisionCache = new Map()

async function listRevisions(pageId) {
  const db = await getDb()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const index = tx.objectStore(STORE_NAME).index('byPage')
  const revs = await index.getAll(pageId)
  await tx.done
  return revs.sort((a, b) => a.timestamp - b.timestamp)
}

async function getLatestRevision(pageId) {
  if (latestRevisionCache.has(pageId)) {
    return latestRevisionCache.get(pageId)
  }
  const revs = await listRevisions(pageId)
  const latest = revs.length ? revs[revs.length - 1] : null
  latestRevisionCache.set(pageId, latest)
  return latest
}

async function restoreRevision(rev) {
  // Clear cache for this pageId
  latestRevisionCache.delete(rev.pageId)
  return newRevision({
    id: rev.pageId,
    content: rev.content,
    published: rev.published,
  })
}

async function newRevision(page) {
  // Clear cache for this pageId
  latestRevisionCache.delete(page.id)
  const db = await getDb()
  const now = Date.now()
  const rev = {
    revId: `${page.id}-${now}`,
    pageId: page.id,
    timestamp: now,
    createdAt: now,
    content: page.content,
    published: false,
  }
  await db.put(STORE_NAME, rev)
  return rev
}

export function createRevisionsStore(docId) {
  const { subscribe, set, update } = writable([])

  async function refresh() {
    const revs = await listRevisions(docId)
    set(revs.slice().reverse())
  }

  async function restore(rev) {
    const newRev = await restoreRevision(rev)
    await refresh()
    return newRev
  }

  async function getLatest() {
    return getLatestRevision(docId)
  }

  async function create(content) {
    const rev = await newRevision({ id: docId, content, published: false })
    update((current) => [rev, ...current])
    latestRevisionCache.set(docId, rev)
    return rev
  }

  return {
    subscribe,
    set,
    update,
    refresh,
    restore,
    getLatest,
    create,
  }
}
