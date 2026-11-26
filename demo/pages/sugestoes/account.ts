import { apiEndpoint } from './loadSuggestions.ts'

import type { AccountState, SendResult, Suggestion, VoteResult } from './types.ts'
import type { Draft } from './draft.ts'

export const sessionEndpoint = '/api/session'

export const loginUrl = '/api/auth/login'

export const logoutEndpoint = '/api/auth/logout'

export const voteEndpoint = (id: number) => `/api/suggestions/${id}/vote`

const unavailable: AccountState = { status: 'unavailable' }

const headers = { Accept: 'application/json' }

const isJson = (response: Response) => response.ok && (response.headers.get('Content-Type') ?? '').includes('application/json')

const numbers = (value: unknown) => (Array.isArray(value) ? value.filter((item): item is number => typeof item === 'number') : [])

export const loadAccount = async (signal: AbortSignal): Promise<AccountState> => {
  try {
    const response = await fetch(sessionEndpoint, { headers, signal })
    const { user, voted }: { user?: { login?: unknown; avatarUrl?: unknown } | null; voted?: unknown } = isJson(response) ? await response.json() : {}

    if (user === null) return { status: 'anonymous' }
    if (typeof user?.login !== 'string') return unavailable

    return { status: 'signed', user: { login: user.login, avatarUrl: typeof user.avatarUrl === 'string' ? user.avatarUrl : '' }, voted: numbers(voted) }
  } catch {
    return unavailable
  }
}

export const sendVote = async (id: number, voted: boolean): Promise<VoteResult> => {
  try {
    const { ok, status } = await fetch(voteEndpoint(id), { method: voted ? 'PUT' : 'DELETE', headers })

    if (ok) return 'ok'
    if (status === 401) return 'signedOut'

    return status === 429 ? 'limited' : 'failed'
  } catch {
    return 'failed'
  }
}

export const sendLogout = async () => {
  try {
    return (await fetch(logoutEndpoint, { method: 'POST', headers })).ok
  } catch {
    return false
  }
}

export const sendSuggestion = async (draft: Draft): Promise<SendResult> => {
  try {
    const response = await fetch(apiEndpoint, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(draft) })
    const body: { suggestion?: Suggestion; listed?: unknown; error?: unknown; problems?: unknown } = (response.headers.get('Content-Type') ?? '').includes('application/json') ? await response.json() : {}

    if (response.ok && body.suggestion && typeof body.suggestion.id === 'number') return { status: 'ok', suggestion: body.suggestion, listed: body.listed !== false }
    if (response.status === 401) return { status: 'signedOut' }
    if (response.status === 422 && typeof body.problems === 'object' && body.problems !== null) return { status: 'invalid', problems: body.problems as Record<string, string> }
    if (response.status === 429) return { status: body.error === 'daily limit' ? 'daily' : 'limited' }

    return { status: 'failed' }
  } catch {
    return { status: 'failed' }
  }
}
