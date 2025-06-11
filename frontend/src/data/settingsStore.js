import { writable } from 'svelte/store'

const initial = {
  showPreview: false,
  showRevisions: false,
  showButtons: true,
  handle: '',
  byline: '',
}

const stored = localStorage.getItem('settings')
const parsed = stored ? JSON.parse(stored) : initial

export const settings = writable(parsed)

settings.subscribe((value) => {
  localStorage.setItem('settings', JSON.stringify(value))
})
