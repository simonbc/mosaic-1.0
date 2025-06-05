import { writable, derived } from 'svelte/store'

export const editing = writable(false)
export const responding = writable(false)
export const previewRevision = writable(null)
export const showSidebar = derived(editing, ($editing) => !$editing)
export const showPublishDialog = writable(false)

export const headerNav = writable([])
export const footerNav = writable([])
