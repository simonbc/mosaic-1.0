import { createPage } from './data/pages.js'
import { navigateTo } from './routing.js'
import { editing } from './data/uiStore.js'
import { apiFetch } from './utils/fetch.js'

let handled = false

export async function maybeHandleRiff(slug) {
  if (handled) return

  const segments = slug.split('/')
  if (segments[0] !== 'r' || segments.length !== 3) return

  const [_, handle, parentSlug] = segments
  handled = true

  try {
    const source = await apiFetch(`/api/page/${handle}/${parentSlug}`)

    const newSlug = `r-${Date.now()}`

    const page = {
      slug: newSlug,
      title: `Riff on: ${source.title}`,
      license: source.license,
      byline: '',
      riffedFrom: { ...source },
      cursorPosition: 0,
      published: false,
    }

    const revision = {
      content: '',
      published: false,
    }

    await createPage(page, revision)
    editing.set(true)
    navigateTo(newSlug)
  } catch (err) {
    console.error('Failed to start riff:', err)
  }
}
