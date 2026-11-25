import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { commentsEndpoint, issuesEndpoint } from '@demo/pages/sugestoes/github.ts'

import { callsTo, env, github, headerOf, pkcs1, refused, start, tokenEndpoint } from './defaultData.ts'

const site = 'https://enchase.othiagosilva.com.br'

const stored = new Map<string, Response>()

const background: Promise<unknown>[] = []

const context = { waitUntil: (promise: Promise<unknown>) => void background.push(promise) }

const cache = {
  match: async ({ url }: Request) => stored.get(url)?.clone(),
  put: async ({ url }: Request, response: Response) => void stored.set(url, response)
}

const load = async () => (await import('@worker/index.ts')).default

const ask = async (path = '/api/suggestions', init: RequestInit = {}) => {
  const worker = await load()
  const response = await worker.fetch(new Request(`${site}${path}`, init), env, context)

  await Promise.all(background.splice(0))

  return response
}

beforeEach(() => {
  vi.resetModules()
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(start)
  vi.stubGlobal('caches', { open: async () => cache })
  stored.clear()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Worker', () => {
  it('answers the suggestions as JSON that the visitor and the edge keep for a minute', async () => {
    vi.stubGlobal('fetch', github())

    const response = await ask()

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json; charset=utf-8')
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=60')
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(response.headers.get('Access-Control-Allow-Origin')).toBeNull()
    expect(await response.json()).toEqual({
      items: [
        { id: 1, url: 'https://github.com/thiagopedro99/enchase/issues/1', title: 'Code block', text: 'A block of code.', kind: 'melhoria', votes: 31, comments: 2, status: 'analise', createdAt: '2026-11-20T12:00:00Z' },
        { id: 2, url: 'https://github.com/thiagopedro99/enchase/issues/2', title: 'React 18', text: 'Support it.', kind: 'melhoria', votes: 4, comments: 1, status: 'recusado', createdAt: '2026-11-21T12:00:00Z', reason: 'React 19 only.' }
      ]
    })
  })

  it('reads GitHub with the token of the installation, never with the key', async () => {
    const fetcher = github()

    vi.stubGlobal('fetch', fetcher)
    await ask()

    expect(headerOf(fetcher, issuesEndpoint, 'Authorization')).toBe('Bearer ghs_token1')
    expect(headerOf(fetcher, commentsEndpoint, 'Authorization')).toBe('Bearer ghs_token1')
    expect(headerOf(fetcher, issuesEndpoint, 'User-Agent')).toBe('enchase-suggestions')
  })

  it('serves the next visitors from the cache, whatever the query string', async () => {
    const fetcher = github()

    vi.stubGlobal('fetch', fetcher)

    const first = await ask()
    const second = await ask('/api/suggestions?fresh=1')

    expect(await second.json()).toEqual(await first.json())
    expect(callsTo(fetcher, issuesEndpoint)).toHaveLength(1)
    expect(Array.from(stored.keys())).toEqual([`${site}/api/suggestions`])
  })

  it('answers a HEAD request too', async () => {
    vi.stubGlobal('fetch', github())

    expect((await ask('/api/suggestions', { method: 'HEAD' })).status).toBe(200)
  })

  it.each(['/api', '/api/', '/api/suggestions/', '/api/suggestions/1', '/api/session', '/'])('has nothing at %s', async (path) => {
    const fetcher = github()

    vi.stubGlobal('fetch', fetcher)

    const response = await ask(path)

    expect(response.status).toBe(404)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it.each(['POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])('refuses %s', async (method) => {
    const fetcher = github()

    vi.stubGlobal('fetch', fetcher)

    const response = await ask('/api/suggestions', { method })

    expect(response.status).toBe(405)
    expect(response.headers.get('Allow')).toBe('GET, HEAD')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it.each([
    ['the read', { [issuesEndpoint]: refused(403) }],
    ['the token', { [tokenEndpoint]: refused(401) }]
  ])('answers 502 when GitHub refuses %s, keeps nothing and says nothing of the secrets', async (_name, overrides) => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    vi.stubGlobal('fetch', github(overrides))

    const response = await ask()
    const text = await response.text()

    expect(response.status).toBe(502)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(JSON.parse(text)).toEqual({ error: 'unavailable' })
    expect(stored.size).toBe(0)
    expect(logged).toHaveBeenCalledTimes(1)
    expect(`${text}${JSON.stringify(logged.mock.calls)}`).not.toMatch(/ghs_|PRIVATE KEY/)
    expect(JSON.stringify(logged.mock.calls)).not.toContain(pkcs1.split('\n')[1])
  })

  it('answers 502 when the request to GitHub fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('network')))
    )

    expect((await ask()).status).toBe(502)
  })

  it('leaves GitHub alone for fifteen seconds after a failure, then tries again', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const failing = github({ [issuesEndpoint]: refused(500) })
    const worker = await load()
    const get = () => worker.fetch(new Request(`${site}/api/suggestions`), env, context)

    vi.stubGlobal('fetch', failing)

    expect((await get()).status).toBe(502)

    const working = github()

    vi.stubGlobal('fetch', working)
    vi.setSystemTime(start + 14 * 1000)

    expect((await get()).status).toBe(502)
    expect(working).not.toHaveBeenCalled()

    vi.setSystemTime(start + 16 * 1000)

    expect((await get()).status).toBe(200)
  })

  it('asks for a new token after GitHub says that the one it holds is no longer valid', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const worker = await load()
    const get = () => worker.fetch(new Request(`${site}/api/suggestions`), env, context)
    const expired = github({ [issuesEndpoint]: refused(401) })

    vi.stubGlobal('fetch', expired)

    expect((await get()).status).toBe(502)

    const working = github()

    vi.stubGlobal('fetch', working)
    vi.setSystemTime(start + 16 * 1000)

    expect((await get()).status).toBe(200)
    expect(callsTo(working, tokenEndpoint)).toHaveLength(1)
  })
})
