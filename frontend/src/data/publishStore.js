import { writable } from 'svelte/store'

export const publishMetadata = writable({
  byline: '',
  license: 'CC0',
})
