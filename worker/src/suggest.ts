import { checkDraft, dailySuggestions, issueOf } from '../../demo/pages/sugestoes/draft.ts'
import { toSuggestion } from '../../demo/pages/sugestoes/github.ts'
import { endSession, noSessionCookie, readSession } from './session.ts'
import { json, jsonOf, signedOut, tooMany, unavailable } from './http.ts'
import { labelIssue, openIssue } from './github.ts'
import { forgetSuggestions } from './suggestions.ts'

import { keep, recent, waitOf } from './quota.ts'

import type { AccountHandler } from './types.ts'

const largest = 16 * 1024

const created = 201

const unauthorized = 401

const quotaKey = (id: number) => `quota:${id}`

export const suggest: AccountHandler = async ({ request, env, context, url }) => {
  const current = await readSession(request, env)

  if (!current) return signedOut()

  const checked = checkDraft(await jsonOf(request, largest))

  if (!checked.ok) return json({ error: 'invalid', problems: checked.problems }, 422)

  const allowed = await env.SUGGEST_LIMITER.limit({ key: `suggest:${current.user.id}` })
  const times = await recent(env, quotaKey(current.user.id))

  if (!allowed.success) return tooMany()
  if (times.length >= dailySuggestions) return json({ error: 'daily limit', limit: dailySuggestions }, 429, { 'Retry-After': waitOf(times) })

  await keep(env, quotaKey(current.user.id), [...times, Date.now()])

  const { title, body, labels } = issueOf(checked.draft)
  const { status, data: issue } = await openIssue(current.token, title, body).catch(() => ({ status: 0, data: null }))

  if (!issue) await keep(env, quotaKey(current.user.id), times)

  if (status === unauthorized) {
    await endSession(env, current.id)

    return signedOut([noSessionCookie()])
  }

  if (!issue) return unavailable()

  const listed = await labelIssue(env, issue.number, labels)

  context.waitUntil(forgetSuggestions(url))

  return json({ suggestion: toSuggestion({ ...issue, labels: labels.map((name) => ({ name })) }), listed }, created)
}
