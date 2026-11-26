import { checkMove, labelsAfter, milestoneOf, stateAfter } from '../../demo/pages/sugestoes/move.ts'
import { boardLabels, toSuggestion } from '../../demo/pages/sugestoes/github.ts'
import { canMove, changeIssue, commentIssue, milestoneNumber, readIssue } from './github.ts'
import { endSession, noSessionCookie, readSession } from './session.ts'
import { json, signedOut, unavailable } from './http.ts'
import { forgetSuggestions } from './suggestions.ts'

import type { AccountHandler } from './types.ts'

const largest = 4 * 1024

const unauthorized = 401

const bodyOf = async (request: Request): Promise<unknown> => {
  const text = (request.headers.get('Content-Type') ?? '').includes('application/json') ? await request.text() : ''

  try {
    return text !== '' && text.length <= largest ? JSON.parse(text) : null
  } catch {
    return null
  }
}

export const move: AccountHandler = async ({ request, env, context, url }, number) => {
  const current = await readSession(request, env)

  if (!current) return signedOut()

  const checked = checkMove(await bodyOf(request))

  if (!checked.ok) return json({ error: 'invalid', problems: checked.problems }, 422)

  const allowed = await env.LIMITER?.limit({ key: `move:${current.user.id}` })

  if (allowed && !allowed.success) return json({ error: 'too many requests' }, 429, { 'Retry-After': '60' })
  if (!(await canMove(env, current.user, current.token))) return json({ error: 'forbidden' }, 403)

  const { status, data: issue } = await readIssue(current.token, number)

  if (status === unauthorized) {
    await endSession(env, current.id)

    return signedOut([noSessionCookie()])
  }

  if (status !== 200 && status !== 404 && status !== 410) return unavailable()
  if (!issue || !issue.labels.some(({ name }) => boardLabels.includes(name.toLowerCase()))) return json({ error: 'not found' }, 404)

  const milestone = checked.move.status === 'lancado' ? await milestoneNumber(current.token, milestoneOf(checked.move)) : undefined

  if (milestone === null) return unavailable()
  if (checked.move.status === 'recusado' && !(await commentIssue(current.token, number, checked.move.reason))) return unavailable()

  const labels = labelsAfter(
    issue.labels.map(({ name }) => name),
    checked.move
  )
  const { data: changed } = await changeIssue(current.token, number, { labels, ...stateAfter(checked.move), ...(milestone ? { milestone } : {}) })

  if (!changed) return unavailable()

  context.waitUntil(forgetSuggestions(url))

  return json({ suggestion: toSuggestion(changed, new Map(checked.move.reason ? [[number, checked.move.reason]] : [])) })
}
