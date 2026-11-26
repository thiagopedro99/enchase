import { apiEndpoint } from './loadSuggestions.ts'

import type { AccountState, CommentResult, MoveResult, SendResult, Suggestion, ThreadState, VoteResult } from './types.ts'
import type { Comment, Thread } from './comment.ts'
import type { Move } from './move.ts'
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
    const { user, voted, canMove }: { user?: { login?: unknown; avatarUrl?: unknown } | null; voted?: unknown; canMove?: unknown } = isJson(response) ? await response.json() : {}

    if (user === null) return { status: 'anonymous' }
    if (typeof user?.login !== 'string') return unavailable

    return { status: 'signed', user: { login: user.login, avatarUrl: typeof user.avatarUrl === 'string' ? user.avatarUrl : '' }, voted: numbers(voted), canMove: canMove === true }
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

export const statusEndpoint = (id: number) => `/api/suggestions/${id}/status`

export const sendMove = async (id: number, move: Partial<Move>): Promise<MoveResult> => {
  try {
    const response = await fetch(statusEndpoint(id), { method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(move) })
    const body: { suggestion?: Suggestion; problems?: unknown } = (response.headers.get('Content-Type') ?? '').includes('application/json') ? await response.json() : {}

    if (response.ok && body.suggestion && typeof body.suggestion.id === 'number') return { status: 'ok', suggestion: body.suggestion }
    if (response.status === 401) return { status: 'signedOut' }
    if (response.status === 403) return { status: 'forbidden' }
    if (response.status === 422 && typeof body.problems === 'object' && body.problems !== null) return { status: 'invalid', problems: body.problems as Record<string, string> }

    return { status: response.status === 429 ? 'limited' : 'failed' }
  } catch {
    return { status: 'failed' }
  }
}

export const threadEndpoint = (id: number) => `/api/suggestions/${id}/comments`

export const loadThread = async (id: number, signal: AbortSignal): Promise<ThreadState> => {
  try {
    const response = await fetch(threadEndpoint(id), { headers, signal })

    if (response.status === 404) return { status: 'missing' }

    const thread: Partial<Thread> = isJson(response) ? await response.json() : {}

    return typeof thread.title === 'string' && Array.isArray(thread.comments) ? { status: 'ready', thread: thread as Thread } : { status: 'error' }
  } catch {
    return { status: 'error' }
  }
}

export const sendComment = async (id: number, text: string): Promise<CommentResult> => {
  try {
    const response = await fetch(threadEndpoint(id), { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
    const body: { comment?: Comment; error?: unknown } = (response.headers.get('Content-Type') ?? '').includes('application/json') ? await response.json() : {}

    if (response.ok && body.comment && typeof body.comment.id === 'number') return { status: 'ok', comment: body.comment }
    if (response.status === 401) return { status: 'signedOut' }
    if (response.status === 409) return { status: 'locked' }
    if (response.status === 422) return { status: 'invalid' }
    if (response.status === 429) return { status: body.error === 'daily limit' ? 'daily' : 'limited' }

    return { status: 'failed' }
  } catch {
    return { status: 'failed' }
  }
}
