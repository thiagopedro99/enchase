import { createHash } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { account, accountEnv, answered, bodyOf, callsTo, cookiesOf, env, headerOf, keyValue, limiter, oauthEndpoint, revokeEndpoint, site, start as startTime, userEndpoint, userToken, valueOf } from './defaultData.ts'
import { call, loginName, sessionName, signIn, start } from './support.ts'

const stored = new Map<string, Response>()

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(startTime)
  vi.stubGlobal('caches', { open: async () => ({ match: async () => undefined, put: async () => undefined, delete: async ({ url }: Request) => stored.delete(url) }) })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Worker login', () => {
  it('sends the visitor to GitHub with a state and a PKCE challenge that only this browser can answer', async () => {
    vi.stubGlobal('fetch', account())

    const { response, target, cookie, state } = await start(accountEnv())
    const [, verifier = ''] = valueOf(cookie).split('.')

    expect(response.status).toBe(302)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(`${target.origin}${target.pathname}`).toBe('https://github.com/login/oauth/authorize')
    expect(Object.fromEntries(target.searchParams)).toEqual({
      client_id: 'Iv23client',
      redirect_uri: `${site}/api/auth/callback`,
      state,
      code_challenge: createHash('sha256').update(verifier).digest('base64url'),
      code_challenge_method: 'S256'
    })
    expect(state).toMatch(/^[A-Za-z0-9_-]{22}$/)
    expect(verifier).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(cookie).toBe(`${loginName}=${state}.${verifier}; Path=/; Max-Age=600; HttpOnly; Secure; SameSite=Lax`)
  })

  it('gives a new state and a new verifier to each login', async () => {
    vi.stubGlobal('fetch', account())

    const first = await start(accountEnv())
    const second = await start(accountEnv())

    expect(second.state).not.toBe(first.state)
    expect(second.cookie).not.toBe(first.cookie)
  })

  it('trades the code for the token with the verifier of the cookie, opens a session and goes back to the board', async () => {
    const fetcher = account()
    const sessions = keyValue()
    const accountOf = accountEnv(sessions)

    vi.stubGlobal('fetch', fetcher)

    const { pair, state, cookie: loginCookie } = await start(accountOf)
    const response = await call(accountOf, `/api/auth/callback?code=the-code&state=${state}`, { cookie: pair })
    const cookies = cookiesOf(response)

    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/sugestoes')
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer')
    expect(bodyOf(fetcher, oauthEndpoint)).toEqual({ client_id: 'Iv23client', client_secret: 'secret-of-the-app', code: 'the-code', code_verifier: valueOf(loginCookie).split('.')[1], redirect_uri: `${site}/api/auth/callback` })
    expect(headerOf(fetcher, oauthEndpoint, 'Accept')).toBe('application/json')
    expect(headerOf(fetcher, userEndpoint, 'Authorization')).toBe(`Bearer ${userToken}`)
    expect(cookies[loginName]).toBe(`${loginName}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`)
    expect(cookies[sessionName]).toMatch(new RegExp(`^${sessionName}=[A-Za-z0-9_-]{43}; Path=/; Max-Age=28800; HttpOnly; Secure; SameSite=Lax$`))
    expect(sessions.stored.size).toBe(1)
  })

  it('keeps the token out of reach of whoever reads the store: the key is a hash of the cookie and the token is sealed with it', async () => {
    const sessions = keyValue()

    vi.stubGlobal('fetch', account())

    const { id } = await signIn(accountEnv(sessions))
    const [[key, { value, ttl }] = ['', { value: '', ttl: 0 }]] = Array.from(sessions.stored)

    expect(key).toBe(`session:${createHash('sha256').update(id).digest('hex')}`)
    expect(`${key}${value}`).not.toContain(id)
    expect(value).not.toContain(userToken)
    expect(value).not.toContain('ghr_refresh')
    expect(value).not.toContain('hidden@example.com')
    expect(JSON.parse(value)).toMatchObject({ user: { id: 9001, login: 'visitor', avatarUrl: 'https://avatars.githubusercontent.com/u/9001?v=4' }, expires: startTime + 28800 * 1000 })
    expect(ttl).toBe(28800)
  })

  it.each([
    ['is longer than eight hours', 90000, 28800],
    ['is missing', undefined, 28800],
    ['is shorter', 3600, 3600],
    ['is too short for the store', 5, 60]
  ])('ends the session with the token when its life %s', async (_name, expiresIn, seconds) => {
    const sessions = keyValue()

    vi.stubGlobal('fetch', account({ [oauthEndpoint]: answered({ access_token: userToken, expires_in: expiresIn }) }))

    const { cookie } = await signIn(accountEnv(sessions))

    expect(cookie).toContain(`Max-Age=${seconds};`)
    expect(Array.from(sessions.stored.values())[0]?.ttl).toBe(seconds)
  })

  it('reads the answer of GitHub when it comes as a form', async () => {
    vi.stubGlobal('fetch', account({ [oauthEndpoint]: () => Promise.resolve(new Response(`access_token=${userToken}&expires_in=28800&token_type=bearer`, { status: 200 })) }))

    expect((await signIn(accountEnv())).response.headers.get('Location')).toBe('/sugestoes')
  })

  it.each([
    ['the state is not the one of the cookie', (state: string, pair: string) => ({ path: `/api/auth/callback?code=the-code&state=${state}x`, cookie: pair })],
    ['the state is missing', (_state: string, pair: string) => ({ path: '/api/auth/callback?code=the-code', cookie: pair })],
    ['the code is missing', (state: string, pair: string) => ({ path: `/api/auth/callback?state=${state}`, cookie: pair })],
    ['the browser has no login cookie', (state: string) => ({ path: `/api/auth/callback?code=the-code&state=${state}`, cookie: '' })],
    ['the cookie has no verifier', (state: string) => ({ path: `/api/auth/callback?code=the-code&state=${state}`, cookie: `${loginName}=${state}` })]
  ])('refuses the callback when %s, without asking GitHub', async (_name, build) => {
    const fetcher = account()
    const sessions = keyValue()
    const accountOf = accountEnv(sessions)

    vi.stubGlobal('fetch', fetcher)

    const { pair, state } = await start(accountOf)
    const { path, cookie } = build(state, pair)
    const response = await call(accountOf, path, { cookie })

    expect(response.headers.get('Location')).toBe('/sugestoes?login=failed')
    expect(cookiesOf(response)[loginName]).toContain('Max-Age=0')
    expect(cookiesOf(response)[sessionName]).toBeUndefined()
    expect(fetcher).not.toHaveBeenCalled()
    expect(sessions.stored.size).toBe(0)
  })

  it('goes back to the board in silence when the visitor says no on GitHub', async () => {
    const fetcher = account()
    const accountOf = accountEnv()

    vi.stubGlobal('fetch', fetcher)

    const { pair, state } = await start(accountOf)
    const response = await call(accountOf, `/api/auth/callback?error=access_denied&state=${state}`, { cookie: pair })

    expect(response.headers.get('Location')).toBe('/sugestoes')
    expect(cookiesOf(response)[loginName]).toContain('Max-Age=0')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it.each([
    ['refuses the code', { [oauthEndpoint]: answered({ error: 'bad_verification_code' }) }],
    ['fails', { [oauthEndpoint]: answered({}, 500) }],
    ['does not say who the visitor is', { [userEndpoint]: answered({ message: 'Bad credentials' }, 401) }]
  ])('opens no session when GitHub %s', async (_name, overrides) => {
    const sessions = keyValue()
    const accountOf = accountEnv(sessions)

    vi.stubGlobal('fetch', account(overrides))

    const { response, cookie } = await signIn(accountOf)

    expect(response.headers.get('Location')).toBe('/sugestoes?login=failed')
    expect(cookie).toBe('')
    expect(sessions.stored.size).toBe(0)
  })

  it('stops a network address that tries too many codes before it reaches GitHub', async () => {
    const fetcher = account()
    const limit = limiter(false)
    const accountOf = accountEnv(keyValue(), limit)

    vi.stubGlobal('fetch', fetcher)

    const { pair, state } = await start(accountOf)
    const response = await call(accountOf, `/api/auth/callback?code=the-code&state=${state}`, { cookie: pair, headers: { 'CF-Connecting-IP': '203.0.113.7' } })

    expect(response.headers.get('Location')).toBe('/sugestoes?login=failed')
    expect(limit.keys).toEqual(['login:203.0.113.7'])
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('ends the session, revokes the token on GitHub and clears the cookie on logout', async () => {
    const fetcher = account()
    const sessions = keyValue()
    const accountOf = accountEnv(sessions)

    vi.stubGlobal('fetch', fetcher)

    const { pair } = await signIn(accountOf)
    const response = await call(accountOf, '/api/auth/logout', { method: 'POST', cookie: pair })

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ user: null })
    expect(cookiesOf(response)[sessionName]).toBe(`${sessionName}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`)
    expect(sessions.stored.size).toBe(0)
    expect(callsTo(fetcher, revokeEndpoint)[0]?.[1]?.method).toBe('DELETE')
    expect(bodyOf(fetcher, revokeEndpoint)).toEqual({ access_token: userToken })
    expect(headerOf(fetcher, revokeEndpoint, 'Authorization')).toBe(`Basic ${Buffer.from('Iv23client:secret-of-the-app').toString('base64')}`)
    expect((await (await call(accountOf, '/api/session', { cookie: pair })).json()).user).toBeNull()
  })

  it('logs out even when GitHub fails to revoke the token, and when there is no session', async () => {
    const sessions = keyValue()
    const accountOf = accountEnv(sessions)

    vi.stubGlobal('fetch', account({ [revokeEndpoint]: () => Promise.reject(new Error('network')) }))

    const { pair } = await signIn(accountOf)

    expect((await call(accountOf, '/api/auth/logout', { method: 'POST', cookie: pair })).status).toBe(200)
    expect(sessions.stored.size).toBe(0)
    expect((await call(accountOf, '/api/auth/logout', { method: 'POST' })).status).toBe(200)
  })

  it.each([
    ['another site', 'https://evil.example'],
    ['a lookalike of the site', `${site}.evil.example`],
    ['no origin at all', null]
  ])('refuses a logout that comes from %s', async (_name, origin) => {
    const sessions = keyValue()
    const accountOf = accountEnv(sessions)

    vi.stubGlobal('fetch', account())

    const { pair } = await signIn(accountOf)
    const response = await call(accountOf, '/api/auth/logout', { method: 'POST', cookie: pair, origin })

    expect(response.status).toBe(403)
    expect(sessions.stored.size).toBe(1)
  })

  it.each([
    ['/api/auth/login', 'GET'],
    ['/api/auth/callback', 'GET'],
    ['/api/auth/logout', 'POST'],
    ['/api/session', 'GET'],
    ['/api/suggestions/1/vote', 'PUT']
  ])('has no %s while the login of the app is not configured', async (path, method) => {
    const fetcher = account()

    vi.stubGlobal('fetch', fetcher)

    for (const partial of [env, { ...accountEnv(), GITHUB_CLIENT_ID: '' }, { ...accountEnv(), GITHUB_CLIENT_SECRET: undefined }, { ...accountEnv(), SESSIONS: undefined }]) {
      const response = await call(partial as ReturnType<typeof accountEnv>, path, { method })

      expect(response.status).toBe(404)
    }

    expect(fetcher).not.toHaveBeenCalled()
  })

  it.each([
    ['/api/auth/login', 'POST', 'GET'],
    ['/api/auth/callback', 'POST', 'GET'],
    ['/api/auth/logout', 'GET', 'POST'],
    ['/api/session', 'DELETE', 'GET'],
    ['/api/suggestions/1/vote', 'GET', 'PUT, DELETE'],
    ['/api/suggestions/1/vote', 'POST', 'PUT, DELETE']
  ])('answers 405 to %s with %s', async (path, method, allow) => {
    vi.stubGlobal('fetch', account())

    const response = await call(accountEnv(), path, { method })

    expect(response.status).toBe(405)
    expect(response.headers.get('Allow')).toBe(allow)
  })
})
