import { getDb } from './utils.js'

export async function getDraft(pageId) {
  const db = await getDb()
  return db.get('drafts', pageId)
}

export async function saveDraft(pageId, { content, cursorPosition }) {
  const db = await getDb()
  await db.put('drafts', {
    id: pageId,
    content,
    cursorPosition,
    updatedAt: Date.now(),
  })
}

export async function deleteDraft(pageId) {
  const db = await getDb()
  await db.delete('drafts', pageId)
}
