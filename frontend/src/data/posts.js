import { get, writable, derived } from 'svelte/store'
import { v4 as uuidv4 } from 'uuid'

import {
  getOrCreateKeyPair,
  signHandle,
  exportPublicKeyHex,
} from '@utils/crypto.js'
import {
  loadPosts,
  savePosts,
  loadRevisions,
  saveRevisions,
  getDb,
} from './db.js'
import { apiFetch } from '@utils/fetch.js'

function generateSlug() {
  const array = new Uint32Array(2)
  crypto.getRandomValues(array)
  // Create a 13-15 digit number
  const randomNumber = (BigInt(array[0]) << 32n) + BigInt(array[1])
  return randomNumber.toString()
}

export const currentPost = writable(undefined)
export const posts = writable(undefined)
export const revisions = writable(undefined)

const dbReady = getDb()

dbReady.then(() => {
  loadPosts().then((savedPosts) => {
    posts.set(savedPosts ?? {})
  })

  loadRevisions().then((savedRevisions) => {
    revisions.set(savedRevisions ?? {})
  })
})

// persist posts to IndexedDB on any change
posts.subscribe((currentPosts) => {
  savePosts(currentPosts)
})

// persist revisions to IndexedDB on any change
revisions.subscribe((currentRevisions) => {
  saveRevisions(currentRevisions)
})

export function createPost({
  content = '',
  cursorPosition = null,
  slug = null,
}) {
  if (!slug) {
    slug = generateSlug()
  }

  const revisionId = crypto.randomUUID()
  const timestamp = Date.now()

  const post = {
    id: uuidv4(), // Assign internal UUID here
    slug,
    cursorPosition,
    published: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    latestRevisionId: revisionId,
  }

  const revision = {
    content,
    published: false,
  }

  revisions.update((current) => ({
    ...current,
    [revisionId]: {
      ...revision,
      id: revisionId,
      postId: post.id,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  }))

  posts.update((current) => ({
    ...current,
    [post.id]: post,
  }))

  return post
}

export function updatePost(postId, { content, cursorPosition }) {
  const revId = crypto.randomUUID()
  const timestamp = Date.now()

  const currentPosts = get(posts)

  if (!currentPosts[postId]) {
    throw new Error(`Post with id ${postId} not found.`)
  }

  revisions.update((current) => ({
    ...current,
    [revId]: {
      id: revId,
      postId,
      content,
      createdAt: timestamp,
    },
  }))

  posts.update((current) => ({
    ...current,
    [postId]: {
      ...current[postId],
      cursorPosition,
      latestRevisionId: revId,
      updatedAt: timestamp,
    },
  }))

  return revId
}

export async function waitFor(store) {
  if (get(store)) return

  return new Promise((resolve) => {
    const unsubscribe = store.subscribe((value) => {
      if (value) {
        unsubscribe()
        resolve()
      }
    })
  })
}

export async function loadPost(handle, slug) {
  if (!slug) {
    currentPost.set(null)
    return currentPost
  }

  await Promise.all([waitFor(posts), waitFor(revisions)])

  const allPosts = get(posts)
  const post = Object.values(allPosts).find((p) => p.slug === slug) ?? null
  if (!post) {
    console.warn(`Post with slug "${slug}" not found.`)
    currentPost.set(null)
    return currentPost
  }

  const allRevisions = get(revisions)
  const revision = allRevisions[post.latestRevisionId] ?? null
  if (revision) {
    // Local draft
    currentPost.set({
      ...post,
      revision,
      revisions: Object.values(allRevisions)
        .filter((r) => r.postId === post.id)
        .sort((a, b) => b.createdAt - a.createdAt),
    })
    return currentPost
  }

  const publicPost = await fetchPublicPost(handle, slug)

  if (publicPost) {
    // Public post
    currentPost.set(publicPost)
  } else {
    // Not found
    currentPost.set(null)
  }

  return currentPost
}

export async function fetchPost(postId) {
  if (!postId) return null
  try {
    return await apiFetch(`/api/post/${postId}`)
  } catch (err) {
    console.error('Failed to fetch post:', err)
    return null
  }
}

export async function fetchPublicPost(handle, slug) {
  if (!handle || !slug) return null
  try {
    return await apiFetch(`/api/post/${handle}/${slug}`)
  } catch (err) {
    console.error('Failed to fetch post:', err)
    return null
  }
}

export async function deletePost(postId) {
  posts.update((current) => {
    const updated = { ...current }
    delete updated[postId]
    return updated
  })

  revisions.update((current) => {
    const updated = { ...current }
    for (const revId in updated) {
      if (updated[revId].postId === postId) {
        delete updated[revId]
      }
    }
    return updated
  })
}

export async function publishPost(post, revision) {
  const { privateKeyJwk, publicKeyJwk } = await getOrCreateKeyPair()

  const publicHex = await exportPublicKeyHex(publicKeyJwk)
  const signature = await signHandle(post.handle, privateKeyJwk)

  const body = JSON.stringify({
    handle: post.handle,
    slug: post.slug,
    content: revision.content,
    created_at: post.createdAt,
    updated_at: Date.now(),
    byline: post.byline,
    signature,
    public_key: publicHex,
  })

  try {
    const { id } = await apiFetch(`/api/post/${post.handle}/${post.slug}`, {
      method: 'POST',
      body,
    })

    posts.update((current) => ({
      ...current,
      [post.id]: {
        ...current[post.id],
        handle: post.handle,
        byline: post.byline,
        published: true,
      },
    }))

    revisions.update((current) => ({
      ...current,
      [revision.id]: {
        ...current[revision.id],
        published: true,
      },
    }))

    await loadPost(post.handle, post.slug)
  } catch (err) {
    alert('Failed to publish post')
    console.error(err)
  }
}

export async function deletePublishedPost(handle, slug) {
  if (!handle || !slug) {
    console.error('Handle and slug are required to delete a published post')
    return
  }

  try {
    await apiFetch(`/api/post/${handle}/${slug}`, {
      method: 'DELETE',
    })
  } catch (err) {
    console.error('Failed to delete published post:', err)
  }
}

export async function checkHandleAvailability(handle) {
  if (!handle) return false

  const { privateKeyJwk } = await getOrCreateKeyPair()
  const signature = await signHandle(handle, privateKeyJwk)

  const body = JSON.stringify({
    signature,
  })

  try {
    const { available } = await apiFetch(`/api/handle/${handle}/check`, {
      method: 'POST',
      body,
    })

    return available
  } catch (err) {
    console.error('Failed to check handle availability:', err)
    return false
  }
}

export const draftCount = derived(posts, ($posts) => {
  if (!$posts) return 0
  return Object.values($posts).filter((post) => !post.published).length
})

export function getDrafts() {
  const allPosts = get(posts)
  const allRevs = get(revisions)

  return Object.values(allPosts)
    .filter((post) => !post.published)
    .map((post) => {
      const revision = allRevs[post.latestRevisionId]
      return {
        ...post,
        content: revision?.content ?? '',
        updatedAt: revision?.updatedAt ?? post.updatedAt,
      }
    })
    .sort((a, b) => b.createdAt - a.createdAt)
}

export async function fetchPostsByHandle(handle) {
  if (!handle) return []
  try {
    return await apiFetch(`/api/handle/${handle}/posts`)
  } catch (err) {
    console.error(`Failed to fetch posts for handle "${handle}":`, err)
    return []
  }
}
