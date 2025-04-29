import { writable } from 'svelte/store'
import { loadRevisions, saveRevisions } from './db.js'

export const revisions = writable({})
export const revisionsLoaded = writable(false)

loadRevisions().then((savedRevisions) => {
  console.log('Loaded revisions from IndexedDB:', savedRevisions)
  revisions.set(savedRevisions)
  revisionsLoaded.set(true)
})

revisions.subscribe((currentRevisions) => {
  saveRevisions(currentRevisions)
})
