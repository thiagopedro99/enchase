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
