import { checkComment, dailyComments } from '../../demo/pages/sugestoes/comment.ts'
import { boardLabels } from '../../demo/pages/sugestoes/github.ts'
import { endSession, noSessionCookie, readSession } from './session.ts'
import { json, jsonOf, signedOut, tooMany, unavailable } from './http.ts'
import { postComment, readIssue, threadOf } from './github.ts'
import { forgetSuggestions } from './suggestions.ts'
import { keep, recent, waitOf } from './quota.ts'

import type { AccountHandler, Handler } from './types.ts'

const cacheName = 'comments'

const life = 60

const largest = 8 * 1024

const unauthorized = 401

const quotaKey = (id: number) => `comments:${id}`

const keyOf = ({ origin }: URL, number: number) => new Request(new URL(`/api/suggestions/${number}/comments`, origin), { method: 'GET' })

const notFound = () => json({ error: 'not found' }, 404, { 'Cache-Control': `public, max-age=${life}` })

export const thread: Handler = async ({ env, context, url }, number) => {
  const cache = await caches.open(cacheName)
  const key = keyOf(url, number)
  const stored = await cache.match(key)

  if (stored) return stored

  try {
    const { status, data } = await threadOf(env, number)

    if (status !== 200) return unavailable()

    const response = data ? json(data, 200, { 'Cache-Control': `public, max-age=${life}` }) : notFound()

    context.waitUntil(cache.put(key, response.clone()))

    return response
  } catch (error) {
    console.error('comments:', error instanceof Error ? error.message : 'unknown failure')

    return unavailable()
  }
}

export const comment: AccountHandler = async ({ request, env, context, url }, number) => {
  const current = await readSession(request, env)

  if (!current) return signedOut()

  const checked = checkComment(await jsonOf(request, largest))

  if (!checked.ok) return json({ error: 'invalid', problem: checked.problem }, 422)
  if (!(await env.COMMENT_LIMITER.limit({ key: `comment:${current.user.id}` })).success) return tooMany()

  const times = await recent(env, quotaKey(current.user.id))

  if (times.length >= dailyComments) return json({ error: 'daily limit', limit: dailyComments }, 429, { 'Retry-After': waitOf(times) })

  const { status, data: issue } = await readIssue(current.token, number)

  if (status === unauthorized) {
    await endSession(env, current.id)

    return signedOut([noSessionCookie()])
  }

  if (status !== 200 && status !== 404 && status !== 410) return unavailable()
  if (!issue || !issue.labels.some(({ name }) => boardLabels.includes(name.toLowerCase()))) return json({ error: 'not found' }, 404)
  if (issue.locked) return json({ error: 'locked' }, 409)

  await keep(env, quotaKey(current.user.id), [...times, Date.now()])

  const { data: posted } = await postComment(current.token, number, checked.text).catch(() => ({ data: null }))

  if (!posted) {
    await keep(env, quotaKey(current.user.id), times)

    return unavailable()
  }

  const cache = await caches.open(cacheName)

  context.waitUntil(Promise.all([cache.delete(keyOf(url, number)), forgetSuggestions(url)]))

  return json({ comment: posted }, 201)
}
