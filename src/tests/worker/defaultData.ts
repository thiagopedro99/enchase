import { generateKeyPairSync } from 'node:crypto'
import { vi } from 'vitest'

import { commentsEndpoint, issuesEndpoint } from '@demo/pages/sugestoes/github.ts'

import type { GithubIssue } from '@demo/pages/sugestoes/github.ts'
import type { Env } from '@worker/types.ts'

const pair = generateKeyPairSync('rsa', { modulusLength: 2048 })

export const publicKey = pair.publicKey

export const pkcs1 = pair.privateKey.export({ type: 'pkcs1', format: 'pem' }).toString()

export const pkcs8 = pair.privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()

export const pkcs8Der = new Uint8Array(pair.privateKey.export({ type: 'pkcs8', format: 'der' }))

export const env: Env = { GITHUB_APP_ID: '424242', GITHUB_APP_PRIVATE_KEY: pkcs1 }

export const installationEndpoint = 'https://api.github.com/repos/thiagopedro99/enchase/installation'

export const tokenEndpoint = 'https://api.github.com/app/installations/77/access_tokens'

export const hour = 60 * 60 * 1000

export const start = new Date('2026-11-25T12:00:00Z').getTime()

export const issues: GithubIssue[] = [
  { number: 1, html_url: 'https://github.com/thiagopedro99/enchase/issues/1', title: 'Code block', body: 'A block of code.', state: 'open', comments: 2, created_at: '2026-11-20T12:00:00Z', labels: [{ name: 'enhancement' }], milestone: null, reactions: { '+1': 31 } },
  { number: 2, html_url: 'https://github.com/thiagopedro99/enchase/issues/2', title: 'React 18', body: 'Support it.', state: 'open', comments: 1, created_at: '2026-11-21T12:00:00Z', labels: [{ name: 'enhancement' }, { name: 'wontfix' }], milestone: null, reactions: { '+1': 4 } }
]

const comments = [{ issue_url: 'https://api.github.com/repos/thiagopedro99/enchase/issues/2', body: 'React 19 only.', author_association: 'OWNER' }]

const reply = (body: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))

export const github = (overrides: Record<string, () => Promise<Response>> = {}) => {
  const minted = { count: 0 }

  const answers: Record<string, () => Promise<Response>> = {
    [installationEndpoint]: () => reply({ id: 77 }),
    [tokenEndpoint]: () => {
      minted.count += 1

      return reply({ token: `ghs_token${minted.count}`, expires_at: new Date(Date.now() + hour).toISOString() }, 201)
    },
    [issuesEndpoint]: () => reply({ total_count: issues.length, items: issues }),
    [commentsEndpoint]: () => reply(comments),
    ...overrides
  }

  return vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>((input) => answers[String(input)]?.() ?? reply({ message: 'Not Found' }, 404))
}

export const refused = (status: number) => () => reply({ message: 'refused' }, status)

export const callsTo = (fetcher: ReturnType<typeof github>, url: string) => fetcher.mock.calls.filter(([input]) => String(input) === url)

export const headerOf = (fetcher: ReturnType<typeof github>, url: string, name: string) => new Headers(callsTo(fetcher, url)[0]?.[1]?.headers).get(name) ?? ''

export const site = 'https://enchase.othiagosilva.com.br'

export const oauthEndpoint = 'https://github.com/login/oauth/access_token'

export const userEndpoint = 'https://api.github.com/user'

export const graphqlEndpoint = 'https://api.github.com/graphql'

export const revokeEndpoint = 'https://api.github.com/applications/Iv23client/token'

export const userToken = 'ghu_usertoken'

export const issuesCreateEndpoint = 'https://api.github.com/repos/thiagopedro99/enchase/issues'

export const labelsEndpoint = (number: number) => `https://api.github.com/repos/thiagopedro99/enchase/issues/${number}/labels`

export const permissionEndpoint = 'https://api.github.com/repos/thiagopedro99/enchase/collaborators/visitor/permission'

export const repositoryEndpoint = 'https://api.github.com/repos/thiagopedro99/enchase'

export const milestonesEndpoint = 'https://api.github.com/repos/thiagopedro99/enchase/milestones'

export const milestonesList = `${milestonesEndpoint}?state=all&per_page=100`

export const issueEndpoint = (number: number) => `https://api.github.com/repos/thiagopedro99/enchase/issues/${number}`

export const commentsOf = (number: number) => `${issueEndpoint(number)}/comments`

export const maintainer = () => reply({ permission: 'admin', role_name: 'admin' })

export const tracked = (number: number, labels: string[], extra: Partial<GithubIssue> = {}): GithubIssue => ({ number, html_url: `https://github.com/thiagopedro99/enchase/issues/${number}`, title: 'Sticky columns', body: 'Keep the first column in place.', state: 'open', comments: 1, created_at: '2026-11-20T12:00:00Z', labels: labels.map((name) => ({ name })), milestone: null, reactions: { '+1': 7 }, ...extra })

export const keyValue = () => {
  const stored = new Map<string, { value: string; ttl: number | undefined }>()

  return {
    stored,
    get: async (key: string) => stored.get(key)?.value ?? null,
    put: async (key: string, value: string, options?: { expirationTtl?: number }) => void stored.set(key, { value, ttl: options?.expirationTtl }),
    delete: async (key: string) => void stored.delete(key)
  }
}

export const limiter = (allowed = true) => {
  const keys: string[] = []
  const state = { allowed }

  return { keys, refuse: () => void (state.allowed = false), limit: async ({ key }: { key: string }) => ({ success: keys.push(key) > 0 && state.allowed }) }
}

export const accountEnv = (sessions = keyValue(), limit = limiter()) => ({ ...env, GITHUB_CLIENT_ID: 'Iv23client', GITHUB_CLIENT_SECRET: 'secret-of-the-app', SESSIONS: sessions, LIMITER: limit })

export const board = () => ({
  issues: new Map([
    [1, { id: 'I_one', labels: ['enhancement'] }],
    [2, { id: 'I_two', labels: ['Bug', 'area: Table'] }],
    [3, { id: 'I_three', labels: ['question'] }]
  ]),
  voted: new Set<number>([2])
})

const group = (voted: boolean) => [
  { content: 'THUMBS_UP', viewerHasReacted: voted },
  { content: 'HEART', viewerHasReacted: true }
]

export const account = (overrides: Record<string, (init?: RequestInit) => Promise<Response>> = {}, state = board()) => {
  const numberOf = (id: string) => Array.from(state.issues).find(([, issue]) => issue.id === id)?.[0] ?? 0

  const graphql = (init?: RequestInit) => {
    const { query, variables }: { query: string; variables: { number?: number; id?: string } } = JSON.parse(String(init?.body))
    const issue = state.issues.get(variables.number ?? 0)

    if (query.includes('search(')) return reply({ data: { search: { nodes: [...Array.from(state.issues.keys(), (number) => ({ number, reactionGroups: group(state.voted.has(number)) })), {}] } } })
    if (query.includes('issue(number')) return issue ? reply({ data: { repository: { issue: { id: issue.id, labels: { nodes: issue.labels.map((name) => ({ name })) }, reactionGroups: group(state.voted.has(variables.number ?? 0)) } } } }) : reply({ data: { repository: { issue: null } }, errors: [{ type: 'NOT_FOUND' }] })
    if (query.includes('addReaction')) return reply({ data: { addReaction: { clientMutationId: null } } }).finally(() => state.voted.add(numberOf(variables.id ?? '')))
    if (query.includes('removeReaction')) return reply({ data: { removeReaction: { clientMutationId: null } } }).finally(() => state.voted.delete(numberOf(variables.id ?? '')))

    return reply({ errors: [{ message: 'unknown' }] })
  }

  const opened = { count: 40 }

  const open = (init?: RequestInit) => {
    const { title, body }: { title: string; body: string } = JSON.parse(String(init?.body))

    opened.count += 1

    return reply({ number: opened.count, html_url: `https://github.com/thiagopedro99/enchase/issues/${opened.count}`, title, body, state: 'open', comments: 0, created_at: new Date(Date.now()).toISOString(), labels: [{ name: 'ignored' }], milestone: null, reactions: { '+1': 0 }, user: { login: 'visitor' } }, 201)
  }

  const kept = new Map<number, GithubIssue>([
    [7, tracked(7, ['enhancement', 'area: Table', 'Backlog'])],
    [8, tracked(8, ['question'])]
  ])

  const issueOf = (number: number) => (init?: RequestInit) => {
    const issue = kept.get(number)

    if (!issue) return reply({ message: 'Not Found' }, 404)
    if (init?.method !== 'PATCH') return reply(issue)

    const { labels, state, milestone }: { labels: string[]; state: 'open' | 'closed'; milestone?: number } = JSON.parse(String(init.body))
    const changed = { ...issue, state, labels: labels.map((name) => ({ name })), milestone: milestone ? { title: milestone === 3 ? 'v0.26.0' : 'v0.28.0' } : issue.milestone }

    kept.set(number, changed)

    return reply(changed)
  }

  const answers: Record<string, (init?: RequestInit) => Promise<Response>> = {
    [permissionEndpoint]: () => reply({ permission: 'read', role_name: 'read' }),
    [repositoryEndpoint]: () => reply({ permissions: { admin: false, maintain: false, push: false, triage: false, pull: true } }),
    [issueEndpoint(7)]: issueOf(7),
    [issueEndpoint(8)]: issueOf(8),
    [issueEndpoint(9)]: issueOf(9),
    [milestonesList]: () => reply([{ number: 3, title: 'v0.26.0' }]),
    [milestonesEndpoint]: () => reply({ number: 9, title: 'v0.28.0' }, 201),
    [commentsOf(7)]: () => reply({ id: 1 }, 201),
    [installationEndpoint]: () => reply({ id: 77 }),
    [tokenEndpoint]: () => reply({ token: 'ghs_writetoken', expires_at: new Date(Date.now() + hour).toISOString() }, 201),
    [issuesCreateEndpoint]: open,
    [labelsEndpoint(41)]: () => reply([]),
    [labelsEndpoint(42)]: () => reply([]),
    [labelsEndpoint(43)]: () => reply([]),
    [labelsEndpoint(44)]: () => reply([]),
    [oauthEndpoint]: () => reply({ access_token: userToken, expires_in: 28800, refresh_token: 'ghr_refresh', refresh_token_expires_in: 15897600, token_type: 'bearer', scope: '' }),
    [userEndpoint]: () => reply({ id: 9001, login: 'visitor', avatar_url: 'https://avatars.githubusercontent.com/u/9001?v=4', email: 'hidden@example.com' }),
    [graphqlEndpoint]: graphql,
    [revokeEndpoint]: () => Promise.resolve(new Response(null, { status: 204 })),
    ...overrides
  }
  const fetcher = vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>((input, init) => answers[String(input)]?.(init) ?? reply({ message: 'Not Found' }, 404))

  return Object.assign(fetcher, { state })
}

export const bodyOf = (fetcher: ReturnType<typeof github>, url: string, index = 0) => JSON.parse(String(callsTo(fetcher, url)[index]?.[1]?.body))

export const queriesOf = (fetcher: ReturnType<typeof github>) => callsTo(fetcher, graphqlEndpoint).map(([, init]) => String(JSON.parse(String(init?.body)).query).split(/[ ({]/)[0] + (String(init?.body).includes('addReaction') ? ':add' : String(init?.body).includes('removeReaction') ? ':remove' : String(init?.body).includes('search(') ? ':search' : ':issue'))

export const cookiesOf = (response: Response) => Object.fromEntries(response.headers.getSetCookie().map((value) => [value.slice(0, value.indexOf('=')), value]))

export const valueOf = (cookie = '') => cookie.slice(cookie.indexOf('=') + 1, cookie.indexOf(';'))

export const answered = (body: unknown, status = 200) => () => reply(body, status)
