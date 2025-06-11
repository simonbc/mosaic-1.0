export function shortcut(node, shortcuts) {
  if (!Array.isArray(shortcuts)) {
    shortcuts = [shortcuts]
  }

  function handler(e) {
    for (const {
      key,
      meta = false,
      shift = false,
      alt = false,
      onPress,
    } of shortcuts) {
      const keyMatch = e.key.toLowerCase() === key.toLowerCase()
      const metaMatch = meta ? e.metaKey || e.ctrlKey : true
      const shiftMatch = e.shiftKey === shift
      const altMatch = e.altKey === alt

      if (keyMatch && metaMatch && shiftMatch && altMatch) {
        e.preventDefault()
        onPress(e)
        break
      }
    }
  }

  document.addEventListener('keydown', handler, { capture: true })

  return {
    destroy() {
      document.removeEventListener('keydown', handler, { capture: true })
    },
  }
}
