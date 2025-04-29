import { writable, get } from 'svelte/store'
import { loadDrafts, saveDrafts } from './db.js'

export const drafts = writable({})
export const draftsLoaded = writable(false)

loadDrafts().then((savedDrafts) => {
  console.log('Loaded drafts from IndexedDB:', savedDrafts)
  drafts.set(savedDrafts)
  draftsLoaded.set(true)
})

drafts.subscribe((currentDrafts) => {
  if (draftsLoaded) {
    saveDrafts(currentDrafts)
  }
})

// Helper functions

export function saveDraft(pageId, draftData) {
  drafts.update((current) => ({
    ...current,
    [pageId]: {
      ...draftData,
      updatedAt: Date.now(),
    },
  }))
}

export function getDraft(pageId) {
  return get(drafts)[pageId] || null
}

export function deleteDraft(pageId) {
  drafts.update((current) => {
    const updated = { ...current }
    delete updated[pageId]
    return updated
  })
}
