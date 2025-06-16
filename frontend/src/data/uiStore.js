let cmdTimeout
let cmdTimeoutFired = false
import { writable, derived } from 'svelte/store'

export const editing = writable(false)
export const previewRevision = writable(null)
export const showPublishDialog = writable(false)

export const headerNav = writable([])
export const footerNav = writable([])

export const cmdState = writable({ cmd: false, combo: false, showHint: false })

function handleKeyDown(event) {
  if (event.metaKey && event.key === 'Meta') {
    clearTimeout(cmdTimeout)
    cmdTimeoutFired = false
    cmdTimeout = setTimeout(() => {
      cmdTimeoutFired = true
      cmdState.set({ cmd: true, combo: false, showHint: true })
    }, 500)
  } else if (event.metaKey) {
    // If a non-Meta key is pressed before timeout, cancel showing the hint
    clearTimeout(cmdTimeout)
    cmdState.set({ cmd: false, combo: false, showHint: false })
  }
}

function handleKeyUp(event) {
  clearTimeout(cmdTimeout)
  if (!event.metaKey) {
    cmdState.set({ cmd: false, combo: false, showHint: false })
  }
}

window.addEventListener('keydown', handleKeyDown)
window.addEventListener('keyup', handleKeyUp)
