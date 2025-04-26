import { writable } from 'svelte/store'
import { debounce } from '../utils/timing.js'

export const page = writable({})

const savePage = debounce((value) => {
  localStorage.setItem('page', JSON.stringify(value))
}, 300)

page.subscribe((value) => {
  savePage(value)
})
