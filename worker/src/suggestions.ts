import { readSuggestions } from '../../demo/pages/sugestoes/github.ts'
import { forget, githubHeaders, tokenFor } from './token.ts'
import { json, unavailable, uncached } from './http.ts'

import type { Env, Handler } from './types.ts'

export const suggestionsPath = '/api/suggestions'

const cacheName = 'suggestions'

const life = 20

const pause = 15 * 1000

const state = { failedAt: 0 }

const keyOf = ({ origin }: URL) => new Request(new URL(suggestionsPath, origin), { method: 'GET' })

const read = async (env: Env) => {
  const token = await tokenFor(env)

  return readSuggestions(async (url) => {
    const response = await fetch(url, { headers: { ...githubHeaders, Authorization: `Bearer ${token}` } })

    if (response.status === 401) forget()

    return response
  }, true)
}

const fresh = async (env: Env) => {
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

export const forgetSuggestions = async (url: URL) => {
  const cache = await caches.open(cacheName)

  return cache.delete(keyOf(url))
}

export const suggestions: Handler = async ({ env, context, url }) => {
  const cache = await caches.open(cacheName)
  const key = keyOf(url)
  const stored = await cache.match(key)

  if (stored) return uncached(stored)

  const response = await fresh(env)

  if (response.ok) context.waitUntil(cache.put(key, response.clone()))

  return uncached(response)
}
