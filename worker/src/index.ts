import { readSuggestions } from '../../demo/pages/sugestoes/github.ts'
import { forget, githubHeaders, tokenFor } from './token.ts'

import type { Context, Env } from './types.ts'

const route = '/api/suggestions'

const cacheName = 'suggestions'

const life = 60

const pause = 15 * 1000

const state = { failedAt: 0 }

const json = (body: unknown, status: number, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store', ...headers } })

const unavailable = () => json({ error: 'unavailable' }, 502)

const read = async (env: Env) => {
  const token = await tokenFor(env)

  return readSuggestions(async (url) => {
    const response = await fetch(url, { headers: { ...githubHeaders, Authorization: `Bearer ${token}` } })

    if (response.status === 401) forget()

    return response
  })
}

const suggestions = async (env: Env) => {
  if (Date.now() - state.failedAt < pause) return unavailable()

  try {
    const result = await read(env)

    if (result.ok) return json({ items: result.items }, 200, { 'Cache-Control': `public, max-age=${life}` })

    console.error('suggestions: github refused the read')
  } catch (error) {
    console.error('suggestions:', error instanceof Error ? error.message : 'unknown failure')
  }

  state.failedAt = Date.now()

  return unavailable()
}

const handle = async (request: Request, env: Env, context: Context) => {
  const url = new URL(request.url)

  if (url.pathname !== route) return json({ error: 'not found' }, 404)
  if (request.method !== 'GET' && request.method !== 'HEAD') return json({ error: 'method not allowed' }, 405, { Allow: 'GET, HEAD' })

  const cache = await caches.open(cacheName)
  const key = new Request(new URL(route, url.origin), { method: 'GET' })
  const stored = await cache.match(key)

  if (stored) return stored

  const response = await suggestions(env)

  if (response.ok) context.waitUntil(cache.put(key, response.clone()))

  return response
}

export default { fetch: handle }
