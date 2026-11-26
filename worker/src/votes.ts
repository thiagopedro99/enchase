import { endSession, noSessionCookie, readSession } from './session.ts'
import { canMove, react, subjectOf, votedBy } from './github.ts'
import { json, signedOut, unavailable } from './http.ts'
import { forgetSuggestions } from './suggestions.ts'

import type { Account, AccountHandler, Session } from './types.ts'

const unauthorized = 401

const expire = async (env: Account, { id }: Session) => {
  await endSession(env, id)

  return noSessionCookie()
}

export const session: AccountHandler = async ({ request, env }) => {
  const current = await readSession(request, env)

  if (!current) return json({ user: null })

  const { status, data } = await votedBy(current.token)

  if (status === unauthorized) return json({ user: null }, 200, {}, [await expire(env, current)])

  return json({ user: { login: current.user.login, avatarUrl: current.user.avatarUrl }, voted: data ?? [], canMove: await canMove(env, current.user, current.token) })
}

const change =
  (voted: boolean): AccountHandler =>
  async ({ request, env, context, url }, number) => {
    const current = await readSession(request, env)

    if (!current) return signedOut()

    const allowed = await env.LIMITER?.limit({ key: `vote:${current.user.id}` })

    if (allowed && !allowed.success) return json({ error: 'too many requests' }, 429, { 'Retry-After': '60' })

    const { status, data: subject } = await subjectOf(current.token, number)

    if (status === unauthorized) return signedOut([await expire(env, current)])
    if (status !== 200) return unavailable()
    if (!subject) return json({ error: 'not found' }, 404)
    if (subject.voted !== voted && !(await react(current.token, subject.id, voted))) return unavailable()

    context.waitUntil(forgetSuggestions(url))

    return json({ voted })
  }

export const vote = change(true)

export const unvote = change(false)
