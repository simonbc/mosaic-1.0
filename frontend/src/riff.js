import { createPage } from './data/pages.js'
import { navigateTo } from './routing.js'
import { editing } from './data/uiStore.js'

let handled = false

export async function maybeHandleRiff(slug) {
  if (handled) return

  const segments = slug.split('/')
  if (segments[0] !== 'r' || segments.length !== 3) return

  const [_, handle, sourceSlug] = segments
  handled = true

  try {
    const res = await fetch(
      `http://localhost:8000/api/page/${handle}/${sourceSlug}`
    )
    if (!res.ok) throw new Error('Page not found')

    const source = await res.json()
    const newSlug = `r-${Date.now()}`
    const createdAt = Date.now()

    const page = {
      slug: newSlug,
      title: `Riff on: ${source.title}`,
      license: source.license,
      byline: '',
      createdAt,
      updatedAt: createdAt,
      riffedFrom: { handle, slug: sourceSlug },
    }

    const revision = {
      content: '',
      createdAt,
    }

    await createPage(page, revision)
    editing.set(true)
    navigateTo(newSlug)
  } catch (err) {
    console.error('Failed to start riff:', err)
  }
}
