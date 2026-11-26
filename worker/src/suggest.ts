import { checkDraft, dailySuggestions, issueOf } from '../../demo/pages/sugestoes/draft.ts'
import { toSuggestion } from '../../demo/pages/sugestoes/github.ts'
import { endSession, noSessionCookie, readSession } from './session.ts'
import { json, jsonOf, signedOut, tooMany, unavailable } from './http.ts'
import { labelIssue, openIssue } from './github.ts'
import { forgetSuggestions } from './suggestions.ts'

import type { Account, AccountHandler } from './types.ts'

const day = 24 * 60 * 60

const largest = 16 * 1024

const created = 201

const unauthorized = 401

const quotaKey = (id: number) => `quota:${id}`

const recent = async ({ SESSIONS }: Account, id: number): Promise<number[]> => {
  try {
    const stored: unknown = JSON.parse((await SESSIONS.get(quotaKey(id))) ?? '[]')
    const since = Date.now() - day * 1000

    return Array.isArray(stored) ? stored.filter((time): time is number => typeof time === 'number' && time > since) : []
  } catch {
    return []
  }
}

const keep = ({ SESSIONS }: Account, id: number, times: number[]) => SESSIONS.put(quotaKey(id), JSON.stringify(times), { expirationTtl: day })

export const suggest: AccountHandler = async ({ request, env, context, url }) => {
  const current = await readSession(request, env)

  if (!current) return signedOut()

  const checked = checkDraft(await jsonOf(request, largest))

  if (!checked.ok) return json({ error: 'invalid', problems: checked.problems }, 422)

  const allowed = await env.SUGGEST_LIMITER.limit({ key: `suggest:${current.user.id}` })
  const times = await recent(env, current.user.id)
  const oldest = times[0] ?? Date.now()

  if (!allowed.success) return tooMany()
  if (times.length >= dailySuggestions) return json({ error: 'daily limit', limit: dailySuggestions }, 429, { 'Retry-After': String(Math.max(1, Math.ceil((oldest + day * 1000 - Date.now()) / 1000))) })

  await keep(env, current.user.id, [...times, Date.now()])

  const { title, body, labels } = issueOf(checked.draft)
  const { status, data: issue } = await openIssue(current.token, title, body).catch(() => ({ status: 0, data: null }))

  if (!issue) await keep(env, current.user.id, times)

  if (status === unauthorized) {
    await endSession(env, current.id)

    return signedOut([noSessionCookie()])
  }

  if (!issue) return unavailable()

  const listed = await labelIssue(env, issue.number, labels)

  context.waitUntil(forgetSuggestions(url))

  return json({ suggestion: toSuggestion({ ...issue, labels: labels.map((name) => ({ name })) }), listed }, created)
}
