import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { account, accountEnv, answered, board, graphqlEndpoint, headerOf, keyValue, limiter, permissionEndpoint, queriesOf, repositoryEndpoint, site, start as startTime, userToken } from './defaultData.ts'
import { call, sessionName, signIn } from './support.ts'

const purged: string[] = []

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(startTime)
  vi.stubGlobal('caches', { open: async () => ({ match: async () => undefined, put: async () => undefined, delete: async ({ url }: Request) => purged.push(url) > 0 }) })
  purged.length = 0
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const signed = async (fetcher = account(), sessions = keyValue(), limit = limiter()) => {
  const env = accountEnv(sessions, limit)

  vi.stubGlobal('fetch', fetcher)

  const { pair, id } = await signIn(env)

  fetcher.mockClear()

  return { env, pair, id, fetcher, sessions, limit }
}

describe('Worker session', () => {
  it('says that nobody is signed in without asking GitHub', async () => {
    const fetcher = account()

    vi.stubGlobal('fetch', fetcher)

    const response = await call(accountEnv(), '/api/session')

    expect(response.status).toBe(200)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.json()).toEqual({ user: null })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('says who is signed in and which suggestions the visitor voted for, and nothing else', async () => {
    const { env, pair, fetcher } = await signed()
    const response = await call(env, '/api/session', { cookie: pair })
    const text = await response.text()

    expect(JSON.parse(text)).toEqual({ user: { login: 'visitor', avatarUrl: 'https://avatars.githubusercontent.com/u/9001?v=4' }, voted: [2], canMove: false })
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(text).not.toMatch(/ghu_|9001"|hidden@/)
    expect(headerOf(fetcher, graphqlEndpoint, 'Authorization')).toBe(`Bearer ${userToken}`)
    expect(queriesOf(fetcher)).toEqual(['query:search'])
  })

  it.each([
    ['an admin', { permission: 'admin', role_name: 'admin' }, true],
    ['someone with the maintain role', { permission: 'write', role_name: 'maintain' }, true],
    ['someone who writes', { permission: 'write', role_name: 'write' }, true],
    ['someone who triages', { permission: 'read', role_name: 'triage' }, true],
    ['someone who only reads', { permission: 'read', role_name: 'read' }, false],
    ['someone with no access', { permission: 'none' }, false],
    ['an answer without a role', {}, false]
  ])('says whether %s may move the cards, as GitHub tells the app', async (_name, permission, expected) => {
    const { env, pair, fetcher } = await signed(account({ [permissionEndpoint]: answered(permission) }))

    expect((await (await call(env, '/api/session', { cookie: pair })).json()).canMove).toBe(expected)
    expect(headerOf(fetcher, permissionEndpoint, 'Authorization')).toBe('Bearer ghs_writetoken')
  })

  it('asks GitHub as the visitor when the app may not read the permission, and trusts no one when both fail', async () => {
    const pusher = await signed(account({ [permissionEndpoint]: answered({ message: 'Forbidden' }, 403), [repositoryEndpoint]: answered({ permissions: { push: true } }) }))

    expect((await (await call(pusher.env, '/api/session', { cookie: pusher.pair })).json()).canMove).toBe(true)
    expect(headerOf(pusher.fetcher, repositoryEndpoint, 'Authorization')).toBe(`Bearer ${userToken}`)

    const reader = await signed(account({ [permissionEndpoint]: answered({ message: 'Forbidden' }, 403) }))

    expect((await (await call(reader.env, '/api/session', { cookie: reader.pair })).json()).canMove).toBe(false)

    const broken = await signed(account({ [permissionEndpoint]: () => Promise.reject(new Error('network')) }))

    expect((await (await call(broken.env, '/api/session', { cookie: broken.pair })).json()).canMove).toBe(false)
  })

  it.each([
    ['a cookie that it did not hand out', `${sessionName}=${'a'.repeat(43)}`],
    ['a cookie of another shape', `${sessionName}=../../etc`],
    ['an empty cookie', `${sessionName}=`]
  ])('treats %s as nobody', async (_name, cookie) => {
    const { env, fetcher } = await signed()

    expect(await (await call(env, '/api/session', { cookie })).json()).toEqual({ user: null })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('ends the session eight hours later even when the store still holds it', async () => {
    const { env, pair } = await signed()

    vi.setSystemTime(startTime + 28800 * 1000 + 1)

    expect(await (await call(env, '/api/session', { cookie: pair })).json()).toEqual({ user: null })
  })

  it('treats a stored session that was tampered with as nobody', async () => {
    const { env, pair, sessions } = await signed()
    const [[key, entry] = ['', { value: '{}', ttl: 0 }]] = Array.from(sessions.stored)
    const record = JSON.parse(entry.value)

    sessions.stored.set(key, { ...entry, value: JSON.stringify({ ...record, token: `${record.token.split('.')[0]}.AAAA${record.token.split('.')[1].slice(4)}` }) })

    expect(await (await call(env, '/api/session', { cookie: pair })).json()).toEqual({ user: null })
  })

  it('ends the session when GitHub says that the token is no longer valid', async () => {
    const { env, pair, sessions } = await signed(account({ [graphqlEndpoint]: answered({ message: 'Bad credentials' }, 401) }))
    const response = await call(env, '/api/session', { cookie: pair })

    expect(await response.json()).toEqual({ user: null })
    expect(response.headers.getSetCookie()).toEqual([`${sessionName}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`])
    expect(sessions.stored.size).toBe(0)
  })

  it('keeps the visitor signed in, with no votes marked, when GitHub fails to list them', async () => {
    const { env, pair, sessions } = await signed(account({ [graphqlEndpoint]: answered({ message: 'down' }, 502) }))

    expect(await (await call(env, '/api/session', { cookie: pair })).json()).toEqual({ user: { login: 'visitor', avatarUrl: 'https://avatars.githubusercontent.com/u/9001?v=4' }, voted: [], canMove: false })
    expect(sessions.stored.size).toBe(1)
  })
})

describe('Worker vote', () => {
  it('adds the thumbs up of the visitor to the issue, as the visitor, and forgets the cached list', async () => {
    const { env, pair, fetcher, limit } = await signed()
    const response = await call(env, '/api/suggestions/1/vote', { method: 'PUT', cookie: pair })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ voted: true })
    expect(queriesOf(fetcher)).toEqual(['query:issue', 'mutation:add'])
    expect(headerOf(fetcher, graphqlEndpoint, 'Authorization')).toBe(`Bearer ${userToken}`)
    expect(fetcher.state.voted).toEqual(new Set([2, 1]))
    expect(limit.keys).toEqual(['login:', 'vote:9001'])
    expect(purged).toEqual([`${site}/api/suggestions`])
  })

  it('takes the thumbs up back', async () => {
    const { env, pair, fetcher } = await signed()
    const response = await call(env, '/api/suggestions/2/vote', { method: 'DELETE', cookie: pair })

    expect(await response.json()).toEqual({ voted: false })
    expect(queriesOf(fetcher)).toEqual(['query:issue', 'mutation:remove'])
    expect(fetcher.state.voted).toEqual(new Set())
  })

  it.each([
    ['PUT', 2, true],
    ['DELETE', 1, false]
  ])('answers %s without changing GitHub when the vote is already as asked', async (method, id, voted) => {
    const { env, pair, fetcher } = await signed()
    const response = await call(env, `/api/suggestions/${id}/vote`, { method, cookie: pair })

    expect(await response.json()).toEqual({ voted })
    expect(queriesOf(fetcher)).toEqual(['query:issue'])
  })

  it('matches the labels of the board whatever their case', async () => {
    const { env, pair } = await signed()

    expect((await call(env, '/api/suggestions/2/vote', { method: 'PUT', cookie: pair })).status).toBe(200)
  })

  it.each([
    ['an issue that is not on the board', '/api/suggestions/3/vote'],
    ['an issue that does not exist', '/api/suggestions/999/vote']
  ])('has nothing to vote on at %s', async (_name, path) => {
    const { env, pair, fetcher } = await signed()
    const response = await call(env, path, { method: 'PUT', cookie: pair })

    expect(response.status).toBe(404)
    expect(queriesOf(fetcher)).toEqual(['query:issue'])
    expect(purged).toEqual([])
  })

  it.each(['/api/suggestions/0/vote', '/api/suggestions/01/vote', '/api/suggestions/-1/vote', '/api/suggestions/1e3/vote', '/api/suggestions/abc/vote', '/api/suggestions/1234567890/vote', '/api/suggestions/1/vote/', '/api/suggestions//vote', '/api/suggestions/1/votes'])('has no route at %s', async (path) => {
    const { env, pair, fetcher } = await signed()

    expect((await call(env, path, { method: 'PUT', cookie: pair })).status).toBe(404)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('asks a visitor who is not signed in to sign in, without asking GitHub', async () => {
    const fetcher = account()

    vi.stubGlobal('fetch', fetcher)

    const response = await call(accountEnv(), '/api/suggestions/1/vote', { method: 'PUT' })

    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: 'signed out' })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it.each([
    ['another site', 'https://evil.example', 'PUT'],
    ['another site', 'https://evil.example', 'DELETE'],
    ['a page of plain http', site.replace('https', 'http'), 'PUT'],
    ['no origin at all', null, 'PUT']
  ])('refuses a vote that comes from %s (%s, %s)', async (_name, origin, method) => {
    const { env, pair, fetcher } = await signed()
    const response = await call(env, '/api/suggestions/1/vote', { method, cookie: pair, origin })

    expect(response.status).toBe(403)
    expect(fetcher).not.toHaveBeenCalled()
    expect(fetcher.state.voted).toEqual(new Set([2]))
  })

  it('stops a visitor who votes too fast before reaching GitHub', async () => {
    const { env, pair, fetcher, limit } = await signed()

    limit.refuse()

    const response = await call(env, '/api/suggestions/1/vote', { method: 'PUT', cookie: pair })

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBe('60')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('ends the session and asks to sign in again when GitHub says that the token is no longer valid', async () => {
    const { env, pair, sessions } = await signed(account({ [graphqlEndpoint]: answered({ message: 'Bad credentials' }, 401) }))
    const response = await call(env, '/api/suggestions/1/vote', { method: 'PUT', cookie: pair })

    expect(response.status).toBe(401)
    expect(response.headers.getSetCookie()[0]).toContain('Max-Age=0')
    expect(sessions.stored.size).toBe(0)
  })

  it.each([
    ['is down', answered({ message: 'down' }, 503)],
    ['fails', () => Promise.reject(new Error('network'))]
  ])('answers 502 and keeps the session when GitHub %s', async (_name, answer) => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const { env, pair, sessions } = await signed(account({ [graphqlEndpoint]: answer }))
    const response = await call(env, '/api/suggestions/1/vote', { method: 'PUT', cookie: pair })

    expect(response.status).toBe(502)
    expect(await response.json()).toEqual({ error: 'unavailable' })
    expect(sessions.stored.size).toBe(1)
    expect(purged).toEqual([])
  })

  it('answers 502 when GitHub finds the issue and then refuses the reaction', async () => {
    const state = board()
    const working = account({}, state)
    const fetcher = account({ [graphqlEndpoint]: (init) => (String(init?.body).includes('addReaction') ? answered({ errors: [{ message: 'locked' }] })() : working(graphqlEndpoint, init)) }, state)
    const { env, pair } = await signed(fetcher)
    const response = await call(env, '/api/suggestions/1/vote', { method: 'PUT', cookie: pair })

    expect(response.status).toBe(502)
    expect(state.voted).toEqual(new Set([2]))
    expect(purged).toEqual([])
  })

  it('never says the token of the visitor in an answer', async () => {
    const { env, pair } = await signed()
    const answers = await Promise.all([call(env, '/api/session', { cookie: pair }), call(env, '/api/suggestions/1/vote', { method: 'PUT', cookie: pair }), call(env, '/api/suggestions/3/vote', { method: 'PUT', cookie: pair })])
    const texts = await Promise.all(answers.map(async (response) => `${await response.text()}${JSON.stringify(Array.from(response.headers))}`))

    expect(texts.join('')).not.toMatch(/ghu_|ghr_|secret-of-the-app/)
  })
})
