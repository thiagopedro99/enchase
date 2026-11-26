import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { forget } from '@worker/token.ts'

import { account, accountEnv, answered, bodyOf, callsTo, commentsOf, headerOf, issueEndpoint, keyValue, limiter, maintainer, milestonesEndpoint, milestonesList, permissionEndpoint, site, start as startTime, userToken } from './defaultData.ts'
import { call, signIn } from './support.ts'

const purged: string[] = []

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(startTime)
  vi.stubGlobal('caches', { open: async () => ({ match: async () => undefined, put: async () => undefined, delete: async ({ url }: Request) => purged.push(url) > 0 }) })
  purged.length = 0
  forget()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const signed = async (overrides: Parameters<typeof account>[0] = {}, mayMove = true) => {
  const limit = limiter()
  const sessions = keyValue()
  const env = accountEnv(sessions, limit)
  const fetcher = account({ ...(mayMove ? { [permissionEndpoint]: maintainer } : {}), ...overrides })

  vi.stubGlobal('fetch', fetcher)

  const { pair } = await signIn(env)

  fetcher.mockClear()

  return { env, pair, fetcher, sessions, limit }
}

const send = (env: ReturnType<typeof accountEnv>, pair: string, body: unknown, path = '/api/suggestions/7/status', init: RequestInit & { origin?: string | null } = {}) =>
  call(env, path, { method: 'PUT', cookie: pair, headers: { 'Content-Type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body), ...init })

const patched = (fetcher: ReturnType<typeof account>, number = 7) => callsTo(fetcher, issueEndpoint(number)).filter(([, init]) => init?.method === 'PATCH').map(([, init]) => JSON.parse(String(init?.body)))

describe('Worker move', () => {
  it('moves a card to development as the maintainer: swaps the label of the column and keeps the others', async () => {
    const { env, pair, fetcher, limit } = await signed()
    const response = await send(env, pair, { status: 'desenvolvimento' })

    expect(response.status).toBe(200)
    expect((await response.json()).suggestion).toMatchObject({ id: 7, status: 'desenvolvimento', area: 'Table', votes: 7 })
    expect(patched(fetcher)).toEqual([{ labels: ['enhancement', 'area: Table', 'in progress'], state: 'open' }])
    expect(callsTo(fetcher, issueEndpoint(7)).map(([, init]) => new Headers(init?.headers).get('Authorization'))).toEqual([`Bearer ${userToken}`, `Bearer ${userToken}`])
    expect(limit.keys).toContain('move:9001')
    expect(purged).toEqual([`${site}/api/suggestions`])
  })

  it.each([
    ['analise', ['enhancement', 'area: Table'], 'open'],
    ['backlog', ['enhancement', 'area: Table', 'backlog'], 'open']
  ])('moves a card to %s', async (status, labels, state) => {
    const { env, pair, fetcher } = await signed()
    const response = await send(env, pair, { status })

    expect((await response.json()).suggestion.status).toBe(status)
    expect(patched(fetcher)).toEqual([{ labels, state }])
    expect(callsTo(fetcher, milestonesList)).toHaveLength(0)
    expect(callsTo(fetcher, commentsOf(7))).toHaveLength(0)
  })

  it('releases a card: closes the issue as completed with the milestone of the version, which it finds', async () => {
    const { env, pair, fetcher } = await signed()
    const response = await send(env, pair, { status: 'lancado', version: 'v0.26.0' })

    expect((await response.json()).suggestion).toMatchObject({ status: 'lancado', version: '0.26.0' })
    expect(patched(fetcher)).toEqual([{ labels: ['enhancement', 'area: Table'], state: 'closed', state_reason: 'completed', milestone: 3 }])
    expect(callsTo(fetcher, milestonesEndpoint)).toHaveLength(0)
  })

  it('creates the milestone of a version that has none yet', async () => {
    const { env, pair, fetcher } = await signed()
    const response = await send(env, pair, { status: 'lancado', version: '0.28.0' })

    expect((await response.json()).suggestion).toMatchObject({ status: 'lancado', version: '0.28.0' })
    expect(bodyOf(fetcher, milestonesEndpoint)).toEqual({ title: 'v0.28.0' })
    expect(headerOf(fetcher, milestonesEndpoint, 'Authorization')).toBe(`Bearer ${userToken}`)
    expect(patched(fetcher)[0]).toMatchObject({ milestone: 9, state: 'closed' })
  })

  it('declines a card: comments the reason as the maintainer, labels it and closes it as not planned', async () => {
    const { env, pair, fetcher } = await signed()
    const response = await send(env, pair, { status: 'recusado', reason: '  Enchase is React 19 only.  ' })

    expect((await response.json()).suggestion).toMatchObject({ status: 'recusado', reason: 'Enchase is React 19 only.' })
    expect(bodyOf(fetcher, commentsOf(7))).toEqual({ body: 'Enchase is React 19 only.' })
    expect(headerOf(fetcher, commentsOf(7), 'Authorization')).toBe(`Bearer ${userToken}`)
    expect(patched(fetcher)).toEqual([{ labels: ['enhancement', 'area: Table', 'wontfix'], state: 'closed', state_reason: 'not_planned' }])
  })

  it.each([
    ['a column that does not exist', { status: 'done' }, { status: 'invalid' }],
    ['no body', '', { status: 'invalid' }],
    ['a release without a version', { status: 'lancado' }, { version: 'missing' }],
    ['a release with something that is not a version', { status: 'lancado', version: 'next' }, { version: 'invalid' }],
    ['a refusal without a reason', { status: 'recusado' }, { reason: 'missing' }],
    ['a refusal with a short reason', { status: 'recusado', reason: 'No.' }, { reason: 'short' }],
    ['a refusal with a long reason', { status: 'recusado', reason: 'x'.repeat(601) }, { reason: 'long' }]
  ])('refuses %s before asking GitHub', async (_name, body, problems) => {
    const { env, pair, fetcher } = await signed()
    const response = await send(env, pair, body)

    expect(response.status).toBe(422)
    expect(await response.json()).toEqual({ error: 'invalid', problems })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('refuses a visitor who may not move, whatever the page showed, and changes nothing', async () => {
    const { env, pair, fetcher } = await signed({}, false)
    const response = await send(env, pair, { status: 'backlog' })

    expect(response.status).toBe(403)
    expect(callsTo(fetcher, issueEndpoint(7))).toHaveLength(0)
    expect(purged).toEqual([])
  })

  it('asks GitHub for the permission again on every move, whatever the session remembered', async () => {
    const { env, pair, fetcher } = await signed()

    await call(env, '/api/session', { cookie: pair })
    await send(env, pair, { status: 'desenvolvimento' })
    await send(env, pair, { status: 'backlog' })

    expect(callsTo(fetcher, permissionEndpoint)).toHaveLength(3)
  })

  it('refuses a maintainer who lost the permission since the page was loaded', async () => {
    const state = { allowed: true }
    const { env, pair, fetcher } = await signed({ [permissionEndpoint]: () => answered(state.allowed ? { permission: 'admin', role_name: 'admin' } : { permission: 'read', role_name: 'read' })() })

    expect((await (await call(env, '/api/session', { cookie: pair })).json()).canMove).toBe(true)

    state.allowed = false

    expect((await send(env, pair, { status: 'backlog' })).status).toBe(403)
    expect(patched(fetcher)).toEqual([])
  })

  it('asks a visitor who is not signed in to sign in', async () => {
    const fetcher = account()

    vi.stubGlobal('fetch', fetcher)

    expect((await send(accountEnv(), '', { status: 'backlog' })).status).toBe(401)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it.each([
    ['another site', 'https://evil.example'],
    ['no origin at all', null]
  ])('refuses a move that comes from %s', async (_name, origin) => {
    const { env, pair, fetcher } = await signed()

    expect((await send(env, pair, { status: 'backlog' }, '/api/suggestions/7/status', { origin })).status).toBe(403)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it.each([
    ['an issue that is not on the board', '/api/suggestions/8/status'],
    ['an issue that does not exist', '/api/suggestions/9/status']
  ])('has nothing to move at %s', async (_name, path) => {
    const { env, pair, fetcher } = await signed()
    const response = await send(env, pair, { status: 'backlog' }, path)

    expect(response.status).toBe(404)
    expect(patched(fetcher, 8)).toEqual([])
  })

  it.each(['/api/suggestions/0/status', '/api/suggestions/7/status/', '/api/suggestions/7/state', '/api/suggestions/abc/status'])('has no route at %s', async (path) => {
    const { env, pair, fetcher } = await signed()

    expect((await send(env, pair, { status: 'backlog' }, path)).status).toBe(404)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it.each(['GET', 'POST', 'DELETE'])('answers 405 to %s', async (method) => {
    const { env, pair } = await signed()
    const response = await call(env, '/api/suggestions/7/status', { method, cookie: pair })

    expect(response.status).toBe(405)
    expect(response.headers.get('Allow')).toBe('PUT')
  })

  it('stops a maintainer who moves too fast before reaching GitHub', async () => {
    const { env, pair, fetcher, limit } = await signed()

    limit.refuse()

    expect((await send(env, pair, { status: 'backlog' })).status).toBe(429)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('ends the session when GitHub says that the token is no longer valid', async () => {
    const { env, pair, sessions } = await signed({ [issueEndpoint(7)]: answered({ message: 'Bad credentials' }, 401) })
    const response = await send(env, pair, { status: 'backlog' })

    expect(response.status).toBe(401)
    expect(response.headers.getSetCookie()[0]).toContain('Max-Age=0')
    expect(Array.from(sessions.stored.keys()).filter((key) => key.startsWith('session:'))).toEqual([])
  })

  it.each([
    ['cannot read the issue', { [issueEndpoint(7)]: answered({ message: 'down' }, 503) }, { status: 'backlog' }],
    ['cannot list the milestones', { [milestonesList]: answered({ message: 'down' }, 500) }, { status: 'lancado', version: '0.28.0' }],
    ['cannot create the milestone', { [milestonesEndpoint]: answered({ message: 'Forbidden' }, 403) }, { status: 'lancado', version: '0.28.0' }],
    ['cannot comment the reason', { [commentsOf(7)]: answered({ message: 'Forbidden' }, 403) }, { status: 'recusado', reason: 'Enchase is React 19 only.' }]
  ])('answers 502 and leaves the issue as it was when GitHub %s', async (_name, overrides, body) => {
    const { env, pair, fetcher } = await signed(overrides)
    const response = await send(env, pair, body)

    expect(response.status).toBe(502)
    expect(patched(fetcher)).toEqual([])
    expect(purged).toEqual([])
  })

  it('never says a token in the answer', async () => {
    const { env, pair } = await signed()
    const response = await send(env, pair, { status: 'desenvolvimento' })

    expect(`${await response.text()}${JSON.stringify(Array.from(response.headers))}`).not.toMatch(/ghu_|ghs_|secret-of-the-app/)
  })
})
