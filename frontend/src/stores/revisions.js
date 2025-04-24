import { getDb } from './utils.js'

const STORE_NAME = 'revisions'

/**
 * Record a new revision snapshot for a given page object.
 * @param {{ id: string, content: string, published: boolean }} page
 * @returns {Promise<Object>} the revision record
 */
export async function newRevision(page) {
  const db = await getDb()
  const now = Date.now()
  const rev = {
    revId: `${page.id}-${now}`, // e.g. "page123-1610000000000"
    pageId: page.id,
    timestamp: now,
    createdAt: now,
    content: page.content,
    published: false,
  }
  await db.put(STORE_NAME, rev)
  return rev
}

/**
 * List all revisions for a given page, sorted oldest → newest.
 * @param {string} pageId
 * @returns {Promise<Array>} list of revision objects
 */
export async function listRevisions(pageId) {
  const db = await getDb()
  const tx = db.transaction(STORE_NAME, 'readonly')
  const index = tx.objectStore(STORE_NAME).index('byPage')
  const revs = await index.getAll(pageId)
  await tx.done
  return revs.sort((a, b) => a.timestamp - b.timestamp)
}

/**
 * Delete a specific revision.
 * @param {string} revId
 * @returns {Promise<void>}
 */
export async function deleteRevision(revId) {
  const db = await getDb()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  await tx.objectStore(STORE_NAME).delete(revId)
  await tx.done
}

/**
 * Get the latest revision for a given page ID.
 * @param {string} pageId
 * @returns {Promise<Object|null>} the latest revision object or null
 */
export async function getLatestRevision(pageId) {
  const revs = await listRevisions(pageId)
  return revs.length ? revs[revs.length - 1] : null
}
