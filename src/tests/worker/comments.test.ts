import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { forget } from '@worker/token.ts'

import { account, accountEnv, answered, bodyOf, callsTo, commentsOf, graphqlEndpoint, headerOf, hour, issueEndpoint, keyValue, limiter, site, start as startTime, tracked, userToken } from './defaultData.ts'
import { call, signIn } from './support.ts'

const stored = new Map<string, Response>()

const path = '/api/suggestions/7/comments'

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(startTime)
  vi.stubGlobal('caches', { open: async () => ({ match: async ({ url }: Request) => stored.get(url)?.clone(), put: async ({ url }: Request, response: Response) => void stored.set(url, response), delete: async ({ url }: Request) => stored.delete(url) }) })
  stored.clear()
  forget()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const signed = async (overrides: Parameters<typeof account>[0] = {}) => {
  const sessions = keyValue()
  const limit = limiter()
  const env = accountEnv(sessions, limiter(), limiter(), limit)
  const fetcher = account(overrides)

  vi.stubGlobal('fetch', fetcher)

  const { pair } = await signIn(env)

  fetcher.mockClear()

  return { env, pair, fetcher, sessions, limit }
}

const post = (env: ReturnType<typeof accountEnv>, pair: string, body: unknown = { text: 'I need this too, on small screens.' }, target = path, init: RequestInit & { origin?: string | null } = {}) =>
  call(env, target, { method: 'POST', cookie: pair, headers: { 'Content-Type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body), ...init })

const quotaOf = (sessions: ReturnType<typeof keyValue>) => JSON.parse(sessions.stored.get('comments:9001')?.value ?? '[]')

describe('Worker comments, read', () => {
  it('answers the whole text of the suggestion and its comments as plain text, without the hidden ones, to anyone', async () => {
    const fetcher = account()

    vi.stubGlobal('fetch', fetcher)

    const response = await call({ ...accountEnv(), GITHUB_CLIENT_ID: '' }, path)

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.json()).toEqual({
      id: 7,
      title: 'Sticky columns',
      url: 'https://github.com/thiagopedro99/enchase/issues/7',
      text: 'Keep the first column in place.',
      locked: false,
      total: 4,
      comments: [
        { id: 11, url: 'https://github.com/thiagopedro99/enchase/issues/7#issuecomment-11', author: 'ana', avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4', text: 'I need this too.', createdAt: '2026-11-21T10:00:00Z', maintainer: false },
        { id: 13, url: 'https://github.com/thiagopedro99/enchase/issues/7#issuecomment-13', author: 'thiagopedro99', avatarUrl: 'https://avatars.githubusercontent.com/u/2?v=4', text: 'It is on the list.', createdAt: '2026-11-22T10:00:00Z', maintainer: true },
        { id: 14, url: 'https://github.com/thiagopedro99/enchase/issues/7#issuecomment-14', author: 'ghost', avatarUrl: '', text: 'From a deleted account.', createdAt: '2026-11-23T10:00:00Z', maintainer: false }
      ]
    })
    expect(headerOf(fetcher, graphqlEndpoint, 'Authorization')).toBe('Bearer ghs_writetoken')
    expect(bodyOf(fetcher, graphqlEndpoint).variables).toEqual({ owner: 'thiagopedro99', name: 'enchase', number: 7 })
  })

  it('serves the next readers from the cache', async () => {
    const fetcher = account()

    vi.stubGlobal('fetch', fetcher)
    await call(accountEnv(), path)
    await call(accountEnv(), `${path}?x=1`)

    expect(callsTo(fetcher, graphqlEndpoint)).toHaveLength(1)
    expect(Array.from(stored.keys())).toEqual([`${site}${path}`])
    expect(stored.get(`${site}${path}`)?.headers.get('Cache-Control')).toBe('public, max-age=20')
  })

  it.each([
    ['an issue that is not on the board', '/api/suggestions/8/comments'],
    ['an issue that does not exist', '/api/suggestions/9/comments']
  ])('has nothing at %s, and remembers it for a minute', async (_name, target) => {
    const fetcher = account()

    vi.stubGlobal('fetch', fetcher)

    expect((await call(accountEnv(), target)).status).toBe(404)
    expect((await call(accountEnv(), target)).status).toBe(404)
    expect(callsTo(fetcher, graphqlEndpoint)).toHaveLength(1)
  })

  it.each([
    ['is down', answered({ message: 'down' }, 503)],
    ['fails', () => Promise.reject(new Error('network'))]
  ])('answers 502 and keeps nothing when GitHub %s', async (_name, answer) => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.stubGlobal('fetch', account({ [graphqlEndpoint]: answer }))

    expect((await call(accountEnv(), path)).status).toBe(502)
    expect(stored.size).toBe(0)
  })

  it('takes no comment while the login is not configured', async () => {
    vi.stubGlobal('fetch', account())

    const response = await call({ ...accountEnv(), GITHUB_CLIENT_ID: '' }, path, { method: 'POST' })

    expect(response.status).toBe(405)
    expect(response.headers.get('Allow')).toBe('GET, HEAD')
  })
})

describe('Worker comments, write', () => {
  it('posts the comment as the visitor and answers it, and forgets the cached thread and list', async () => {
    const { env, pair, fetcher, sessions, limit } = await signed()

    await call(env, path)

    const response = await post(env, pair, { text: '  I need this too,\r\non small screens.\u0000  ' })

    expect(response.status).toBe(201)
    expect(await response.json()).toEqual({ comment: { id: 501, url: 'https://github.com/thiagopedro99/enchase/issues/7#issuecomment-501', author: 'visitor', avatarUrl: 'https://avatars.githubusercontent.com/u/9001?v=4', text: 'I need this too,\non small screens.', createdAt: new Date(startTime).toISOString(), maintainer: false } })
    expect(bodyOf(fetcher, commentsOf(7))).toEqual({ body: 'I need this too,\non small screens.' })
    expect(headerOf(fetcher, commentsOf(7), 'Authorization')).toBe(`Bearer ${userToken}`)
    expect(limit.keys).toEqual(['comment:9001'])
    expect(quotaOf(sessions)).toEqual([startTime])
    expect(stored.size).toBe(0)
  })

  it.each([
    ['no text', { text: '   ' }, 'missing'],
    ['one letter', { text: 'a' }, 'short'],
    ['a text that is too long', { text: 'x'.repeat(2001) }, 'long'],
    ['a text of the wrong type', { text: 12 }, 'missing'],
    ['a body that is not JSON', '{text', 'missing']
  ])('refuses %s before asking GitHub', async (_name, body, problem) => {
    const { env, pair, fetcher, sessions } = await signed()
    const response = await post(env, pair, body)

    expect(response.status).toBe(422)
    expect(await response.json()).toEqual({ error: 'invalid', problem })
    expect(fetcher).not.toHaveBeenCalled()
    expect(quotaOf(sessions)).toEqual([])
  })

  it('asks a visitor who is not signed in to sign in', async () => {
    const fetcher = account()

    vi.stubGlobal('fetch', fetcher)

    expect((await post(accountEnv(), '')).status).toBe(401)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it.each([
    ['another site', 'https://evil.example'],
    ['no origin at all', null]
  ])('refuses a comment that comes from %s', async (_name, origin) => {
    const { env, pair, fetcher } = await signed()

    expect((await post(env, pair, undefined, path, { origin })).status).toBe(403)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it.each([
    ['an issue that is not on the board', '/api/suggestions/8/comments'],
    ['an issue that does not exist', '/api/suggestions/9/comments']
  ])('has nothing to comment on at %s', async (_name, target) => {
    const { env, pair, fetcher, sessions } = await signed()

    expect((await post(env, pair, undefined, target)).status).toBe(404)
    expect(callsTo(fetcher, commentsOf(7))).toHaveLength(0)
    expect(quotaOf(sessions)).toEqual([])
  })

  it('says that the issue is locked instead of trying', async () => {
    const { env, pair, fetcher } = await signed({ [issueEndpoint(7)]: answered(tracked(7, ['enhancement'], { locked: true })) })
    const response = await post(env, pair)

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({ error: 'locked' })
    expect(callsTo(fetcher, commentsOf(7))).toHaveLength(0)
  })

  it('stops a visitor who comments too fast before reaching GitHub', async () => {
    const { env, pair, fetcher, limit } = await signed()

    limit.refuse()

    const response = await post(env, pair)

    expect(response.status).toBe(429)
    expect(await response.json()).toEqual({ error: 'too many requests' })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('takes thirty comments in twenty-four hours from each visitor', async () => {
    const { env, pair, fetcher, sessions } = await signed()

    sessions.stored.set('comments:9001', { value: JSON.stringify(Array.from({ length: 30 }, (_item, index) => startTime - hour + index)), ttl: 86400 })

    const refused = await post(env, pair)

    expect(refused.status).toBe(429)
    expect(await refused.json()).toEqual({ error: 'daily limit', limit: 30 })
    expect(refused.headers.get('Retry-After')).toBe(String(23 * 3600))
    expect(fetcher).not.toHaveBeenCalled()

    sessions.stored.set('comments:9001', { value: JSON.stringify(Array.from({ length: 30 }, (_item, index) => startTime - 25 * hour + index)), ttl: 86400 })

    expect((await post(env, pair)).status).toBe(201)
    expect(quotaOf(sessions)).toEqual([startTime])
  })

  it.each([
    ['refuses the comment', answered({ message: 'Forbidden' }, 403)],
    ['fails', () => Promise.reject(new Error('network'))]
  ])('answers 502 and does not count the comment when GitHub %s', async (_name, answer) => {
    const { env, pair, sessions } = await signed({ [commentsOf(7)]: answer })

    expect((await post(env, pair)).status).toBe(502)
    expect(quotaOf(sessions)).toEqual([])
  })

  it('ends the session when GitHub says that the token is no longer valid', async () => {
    const { env, pair, sessions } = await signed({ [issueEndpoint(7)]: answered({ message: 'Bad credentials' }, 401) })
    const response = await post(env, pair)

    expect(response.status).toBe(401)
    expect(response.headers.getSetCookie()[0]).toContain('Max-Age=0')
    expect(Array.from(sessions.stored.keys()).filter((key) => key.startsWith('session:'))).toEqual([])
  })
})
