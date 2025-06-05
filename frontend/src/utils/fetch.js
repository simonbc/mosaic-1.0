import { API_BASE } from '../env.js'

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await res.json()

  if (!res.ok || data.status === 'error') {
    throw new Error(data.message || `API error (${res.status})`)
  }

  return data
}
