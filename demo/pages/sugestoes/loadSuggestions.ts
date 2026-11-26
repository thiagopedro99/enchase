import { readSuggestions } from './github.ts'

import type { Suggestion, SuggestionsResult } from './types.ts'

export const apiEndpoint = '/api/suggestions'

const cacheKey = 'enchase-suggestions'

const cacheLife = 60 * 1000

const pageLoad = Math.random().toString(36).slice(2)

const readStored = (): { at: number; items: Suggestion[] } | null => {
  try {
    const stored = window.sessionStorage.getItem(cacheKey)
    const { at, items, load } = stored ? JSON.parse(stored) : { at: 0, items: null, load: '' }

    return Array.isArray(items) && load === pageLoad && Date.now() - at < cacheLife ? { at, items } : null
  } catch {
    return null
  }
}

const readCache = () => readStored()?.items ?? null

const writeCache = (items: Suggestion[], at = Date.now()) => {
  try {
    window.sessionStorage.setItem(cacheKey, JSON.stringify({ at, items, load: pageLoad }))
  } catch {
    return
  }
}

export const patchVotes = (id: number, delta: number) => {
  const stored = readStored()

  if (stored) writeCache(
    stored.items.map((item) => (item.id === id ? { ...item, votes: Math.max(0, item.votes + delta) } : item)),
    stored.at
  )
}

export const put = (items: Suggestion[], suggestion: Suggestion) => (items.some(({ id }) => id === suggestion.id) ? items.map((item) => (item.id === suggestion.id ? suggestion : item)) : [suggestion, ...items])

export const addToCache = (suggestion: Suggestion) => {
  const stored = readStored()

  if (stored) writeCache(put(stored.items, suggestion), stored.at)
}

const isJson = (response: Response) => response.ok && (response.headers.get('Content-Type') ?? '').includes('application/json')

const fromApi = async (signal: AbortSignal): Promise<Suggestion[] | null> => {
  try {
    const response = await fetch(apiEndpoint, { headers: { Accept: 'application/json' }, signal })
    const { items } = isJson(response) ? await response.json() : { items: null }

    return Array.isArray(items) ? items : null
  } catch {
    return null
  }
}

const fromGithub = async (signal: AbortSignal): Promise<SuggestionsResult> => {
  try {
    return await readSuggestions((url) => fetch(url, { headers: { Accept: 'application/vnd.github+json' }, signal }))
  } catch {
    return { ok: false, limited: false }
  }
}

export const loadSuggestions = async (signal: AbortSignal, fresh = false): Promise<SuggestionsResult> => {
  const cached = fresh ? null : readCache()

  if (cached) return { ok: true, items: cached }

  const served = await fromApi(signal)
  const result: SuggestionsResult = served ? { ok: true, items: served } : await fromGithub(signal)

  if (result.ok) writeCache(result.items)

  return result
}
