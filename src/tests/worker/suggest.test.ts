import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { forget } from '@worker/token.ts'

import { account, accountEnv, answered, bodyOf, callsTo, headerOf, hour, issuesCreateEndpoint, keyValue, labelsEndpoint, limiter, site, start as startTime, tokenEndpoint, userToken } from './defaultData.ts'
import { call, signIn } from './support.ts'

const purged: string[] = []

const draft = { kind: 'melhoria', title: 'Sticky columns in the table', need: 'I need the first column to stay in place while the others scroll.', proposal: 'A prop named sticky on the column.' }

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

const signed = async (fetcher = account(), sessions = keyValue(), limit = limiter()) => {
  const env = accountEnv(sessions, limiter(), limit)

  vi.stubGlobal('fetch', fetcher)

  const { pair } = await signIn(env)

  fetcher.mockClear()

  return { env, pair, fetcher, sessions, limit }
}

const send = (env: ReturnType<typeof accountEnv>, pair: string, body: unknown = draft, init: RequestInit & { origin?: string | null } = {}) =>
  call(env, '/api/suggestions', { method: 'POST', cookie: pair, headers: { 'Content-Type': 'application/json' }, body: typeof body === 'string' ? body : JSON.stringify(body), ...init })

const quotaOf = (sessions: ReturnType<typeof keyValue>) => JSON.parse(sessions.stored.get('quota:9001')?.value ?? '[]')

describe('Worker suggestion', () => {
  it('opens the issue as the visitor, labels it as the app and answers the card', async () => {
    const { env, pair, fetcher, sessions, limit } = await signed()
    const response = await send(env, pair)

    expect(response.status).toBe(201)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(await response.json()).toEqual({
      listed: true,
      suggestion: { id: 41, url: 'https://github.com/thiagopedro99/enchase/issues/41', title: draft.title, text: `${draft.need} ${draft.proposal}`, kind: 'melhoria', votes: 0, comments: 0, status: 'analise', createdAt: new Date(startTime).toISOString() }
    })
    expect(headerOf(fetcher, issuesCreateEndpoint, 'Authorization')).toBe(`Bearer ${userToken}`)
    expect(bodyOf(fetcher, issuesCreateEndpoint)).toEqual({
      title: draft.title,
      body: `**What you need, and what you do today instead**\n\n${draft.need}\n\n**What it would look like**\n\n${draft.proposal}\n\n<!-- sent from the suggestions page of the site -->`
    })
    expect(headerOf(fetcher, labelsEndpoint(41), 'Authorization')).toBe('Bearer ghs_writetoken')
    expect(bodyOf(fetcher, labelsEndpoint(41))).toEqual({ labels: ['enhancement'] })
    expect(bodyOf(fetcher, tokenEndpoint)).toEqual({ repositories: ['enchase'], permissions: { issues: 'write' } })
    expect(purged).toEqual([`${site}/api/suggestions`])
    expect(quotaOf(sessions)).toEqual([startTime])
    expect(sessions.stored.get('quota:9001')?.ttl).toBe(86400)
    expect(limit.keys).toContain('suggest:9001')
  })

  it.each([
    ['componente', ['enhancement', 'component'], 'What you need, and what you do today instead', 'componente'],
    ['correcao', ['bug'], 'What happened, and what you expected', 'correcao']
  ])('labels a suggestion of the kind %s', async (kind, labels, heading, cardKind) => {
    const { env, pair, fetcher } = await signed()
    const response = await send(env, pair, { ...draft, kind })

    expect((await response.json()).suggestion.kind).toBe(cardKind)
    expect(bodyOf(fetcher, labelsEndpoint(41))).toEqual({ labels })
    expect(bodyOf(fetcher, issuesCreateEndpoint).body).toContain(`**${heading}**`)
  })

  it('cleans the text and leaves the second heading out when there is no proposal', async () => {
    const { env, pair, fetcher } = await signed()

    await send(env, pair, { kind: 'melhoria', title: '  Sticky\tcolumns \n in the table\u0000  ', need: `  First line.\r\nSecond line.\u0007 ${'x'.repeat(10)}  `, proposal: '   ' })

    expect(bodyOf(fetcher, issuesCreateEndpoint)).toEqual({ title: 'Sticky columns in the table', body: `**What you need, and what you do today instead**\n\nFirst line.\nSecond line. ${'x'.repeat(10)}\n\n<!-- sent from the suggestions page of the site -->` })
  })

  it.each([
    ['no title', { ...draft, title: ' ' }, { title: 'missing' }],
    ['a short title', { ...draft, title: 'Table' }, { title: 'short' }],
    ['a long title', { ...draft, title: 'x'.repeat(121) }, { title: 'long' }],
    ['a short description', { ...draft, need: 'Too short.' }, { need: 'short' }],
    ['a long description', { ...draft, need: 'x'.repeat(3001) }, { need: 'long' }],
    ['a long proposal', { ...draft, proposal: 'x'.repeat(3001) }, { proposal: 'long' }],
    ['a kind that does not exist', { ...draft, kind: 'pergunta' }, { kind: 'invalid' }],
    ['fields of the wrong type', { kind: 'melhoria', title: 1, need: ['a'], proposal: {} }, { title: 'missing', need: 'missing' }],
    ['a list', [draft], { kind: 'invalid', title: 'missing', need: 'missing' }],
    ['text that is not JSON', '{title', { kind: 'invalid', title: 'missing', need: 'missing' }],
    ['a body that is too large', { ...draft, extra: 'x'.repeat(17000) }, { kind: 'invalid', title: 'missing', need: 'missing' }]
  ])('refuses %s, without asking GitHub and without counting', async (_name, body, problems) => {
    const { env, pair, fetcher, sessions } = await signed()
    const response = await send(env, pair, body)

    expect(response.status).toBe(422)
    expect(await response.json()).toEqual({ error: 'invalid', problems })
    expect(fetcher).not.toHaveBeenCalled()
    expect(quotaOf(sessions)).toEqual([])
  })

  it('refuses a body that does not say that it is JSON', async () => {
    const { env, pair, fetcher } = await signed()
    const response = await send(env, pair, draft, { headers: { 'Content-Type': 'text/plain' } })

    expect(response.status).toBe(422)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('asks a visitor who is not signed in to sign in', async () => {
    const fetcher = account()

    vi.stubGlobal('fetch', fetcher)

    expect((await send(accountEnv(), '')).status).toBe(401)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it.each([
    ['another site', 'https://evil.example'],
    ['no origin at all', null]
  ])('refuses a suggestion that comes from %s', async (_name, origin) => {
    const { env, pair, fetcher } = await signed()

    expect((await send(env, pair, draft, { origin })).status).toBe(403)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('takes three suggestions in twenty-four hours from each visitor and says when the next one fits', async () => {
    const { env, pair, fetcher } = await signed()

    for (const minutes of [0, 10, 20]) {
      vi.setSystemTime(startTime + minutes * 60 * 1000)

      expect((await send(env, pair)).status).toBe(201)
    }

    vi.setSystemTime(startTime + 7 * hour)

    const refused = await send(env, pair)

    expect(refused.status).toBe(429)
    expect(await refused.json()).toEqual({ error: 'daily limit', limit: 3 })
    expect(refused.headers.get('Retry-After')).toBe(String(17 * 3600))
    expect(callsTo(fetcher, issuesCreateEndpoint)).toHaveLength(3)
  })

  it('counts the day from each suggestion, so the fourth is taken once the first is a day old', async () => {
    const sessions = keyValue()
    const { env, pair, fetcher } = await signed(account(), sessions)

    sessions.stored.set('quota:9001', { value: JSON.stringify([startTime - 25 * hour, startTime - 23 * hour, startTime - hour]), ttl: 86400 })

    expect((await send(env, pair)).status).toBe(201)
    expect(quotaOf(sessions)).toEqual([startTime - 23 * hour, startTime - hour, startTime])
    expect((await send(env, pair)).status).toBe(429)
    expect(callsTo(fetcher, issuesCreateEndpoint)).toHaveLength(1)
  })

  it('reads a damaged count as no suggestion yet', async () => {
    const sessions = keyValue()
    const { env, pair } = await signed(account(), sessions)

    sessions.stored.set('quota:9001', { value: '{broken', ttl: 86400 })

    expect((await send(env, pair)).status).toBe(201)
  })

  it('stops a visitor who sends too fast before reaching GitHub', async () => {
    const { env, pair, fetcher, limit } = await signed()

    limit.refuse()

    const response = await send(env, pair)

    expect(response.status).toBe(429)
    expect(await response.json()).toEqual({ error: 'too many requests' })
    expect(fetcher).not.toHaveBeenCalled()
  })

  it.each([
    ['refuses the issue', answered({ message: 'Validation Failed' }, 422)],
    ['is down', answered({ message: 'down' }, 503)],
    ['fails', () => Promise.reject(new Error('network'))],
    ['answers something that is not an issue', answered({ ok: true }, 201)]
  ])('answers 502 and does not count the suggestion when GitHub %s', async (_name, answer) => {
    const { env, pair, fetcher, sessions } = await signed(account({ [issuesCreateEndpoint]: answer }))
    const response = await send(env, pair)

    expect(response.status).toBe(502)
    expect(quotaOf(sessions)).toEqual([])
    expect(callsTo(fetcher, tokenEndpoint)).toHaveLength(0)
    expect(purged).toEqual([])
  })

  it('ends the session and does not count the suggestion when GitHub says that the token is no longer valid', async () => {
    const { env, pair, sessions } = await signed(account({ [issuesCreateEndpoint]: answered({ message: 'Bad credentials' }, 401) }))
    const response = await send(env, pair)

    expect(response.status).toBe(401)
    expect(response.headers.getSetCookie()[0]).toContain('Max-Age=0')
    expect(Array.from(sessions.stored.keys()).filter((key) => key.startsWith('session:'))).toEqual([])
    expect(quotaOf(sessions)).toEqual([])
  })

  it.each([
    ['GitHub refuses the labels', { [labelsEndpoint(41)]: answered({ message: 'Forbidden' }, 403) }],
    ['the app cannot get a token that writes', { [tokenEndpoint]: answered({ message: 'Forbidden' }, 403) }]
  ])('still answers the card, and says that it is not on the board yet, when %s', async (_name, overrides) => {
    const { env, pair, sessions } = await signed(account(overrides))
    const response = await send(env, pair)
    const { suggestion, listed } = await response.json()

    expect(response.status).toBe(201)
    expect(listed).toBe(false)
    expect(suggestion).toMatchObject({ id: 41, status: 'analise', title: draft.title })
    expect(quotaOf(sessions)).toEqual([startTime])
  })

  it('counts the suggestions in a limiter of their own, apart from the votes', async () => {
    const votes = limiter()
    const suggestions = limiter()
    const env = accountEnv(keyValue(), votes, suggestions)

    vi.stubGlobal('fetch', account())

    const { pair } = await signIn(env)

    await send(env, pair)

    expect(suggestions.keys).toEqual(['suggest:9001'])
    expect(votes.keys).toEqual(['login:'])
  })

  it('refuses a body that says it is too large without reading it', async () => {
    const { env, pair, fetcher, sessions } = await signed()
    const response = await send(env, pair, draft, { headers: { 'Content-Type': 'application/json', 'Content-Length': '20000' } })

    expect(response.status).toBe(422)
    expect(fetcher).not.toHaveBeenCalled()
    expect(quotaOf(sessions)).toEqual([])
  })

  it('stops reading a body that grows past the limit, whatever it said about its size', async () => {
    const { env, pair, fetcher } = await signed()
    const pulled = { count: 0 }
    const stream = new ReadableStream<Uint8Array>({
      pull: (controller) => {
        pulled.count += 1

        if (pulled.count > 200) controller.close()
        else controller.enqueue(new TextEncoder().encode('x'.repeat(1024)))
      }
    })
    const response = await call(env, '/api/suggestions', { method: 'POST', cookie: pair, headers: { 'Content-Type': 'application/json' }, body: stream, duplex: 'half' } as RequestInit & { cookie: string })

    expect(response.status).toBe(422)
    expect(pulled.count).toBeLessThan(30)
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('never says a token in the answer', async () => {
    const { env, pair } = await signed()
    const response = await send(env, pair)

    expect(`${await response.text()}${JSON.stringify(Array.from(response.headers))}`).not.toMatch(/ghu_|ghs_|secret-of-the-app/)
  })
})
