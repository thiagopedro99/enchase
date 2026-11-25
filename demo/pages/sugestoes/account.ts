import type { AccountState, VoteResult } from './types.ts'

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
