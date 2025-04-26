import { writable } from 'svelte/store'
import { getDb } from './utils.js'
import { debounce } from '../utils/timing.js'

export function createPageStore(pageId, { debounceMs = 500 } = {}) {
  const defaultPage = {
    id: pageId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    published: false,
    cursorPosition: 0,
  }

  const page = writable(defaultPage, (set) => {
    getDb()
      .then((db) => db.get('pages', pageId))
      .then((stored) => {
        if (stored) {
          set(stored)
        } else {
          set(defaultPage)
          getDb().then((db) => db.put('pages', defaultPage, pageId))
        }
      })

    return () => {}
  })

  const savePage = debounce(async (value) => {
    const db = await getDb()
    const now = Date.now()
    value.updatedAt = now
    await db.put('pages', value, pageId)
  }, debounceMs)

  page.subscribe((value) => {
    savePage(value)
  })

  return {
    subscribe: page.subscribe,
    reset: () => {
      page.set({ ...defaultPage, id: pageId })
    },
    setCursorPosition: (position) => {
      page.update((p) => ({ ...p, cursorPosition: position }))
    },
  }
}
