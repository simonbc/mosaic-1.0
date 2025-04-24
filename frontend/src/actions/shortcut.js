export function shortcut(
  node,
  { key, meta = false, shift = false, alt = false, onPress }
) {
  function handler(e) {
    const keyMatch = e.key.toLowerCase() === key.toLowerCase()
    const metaMatch = meta ? e.metaKey || e.ctrlKey : !e.metaKey && !e.ctrlKey
    const shiftMatch = e.shiftKey === shift
    const altMatch = e.altKey === alt

    if (keyMatch && metaMatch && shiftMatch && altMatch) {
      e.preventDefault()
      onPress(e)
    }
  }
  window.addEventListener('keydown', handler)
  return {
    destroy() {
      window.removeEventListener('keydown', handler)
    },
  }
}
