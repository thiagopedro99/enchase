import { suggestions, suggestionsPath } from './suggestions.ts'
import { json, sameOrigin, unavailable } from './http.ts'
import { callback, login, logout } from './auth.ts'
import { session, unvote, vote } from './votes.ts'
import { suggest } from './suggest.ts'
import { comment, thread } from './comments.ts'
import { move } from './move.ts'

import type { Account, AccountHandler, Call, Context, Env, Handler } from './types.ts'

type Methods = Partial<Record<string, Handler>>

const itemPath = /^\/api\/suggestions\/([1-9]\d{0,8})\/(vote|status|comments)$/

const safe = ['GET', 'HEAD']

const notFound = () => json({ error: 'not found' }, 404)

const configured = (env: Env): env is Account => Boolean(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET && env.SESSIONS && env.LIMITER && env.SUGGEST_LIMITER && env.COMMENT_LIMITER)

const account =
  (handler: AccountHandler): Handler =>
  ({ env, ...call }, id) =>
    configured(env) ? handler({ ...call, env }, id) : Promise.resolve(notFound())

const reading: Methods = { GET: suggestions, HEAD: suggestions }

const publicRoutes: Record<string, Methods> = { [suggestionsPath]: reading }

const accountRoutes: Record<string, Methods> = {
  [suggestionsPath]: { ...reading, POST: account(suggest) },
  '/api/session': { GET: account(session) },
  '/api/auth/login': { GET: account(login) },
  '/api/auth/callback': { GET: account(callback) },
  '/api/auth/logout': { POST: account(logout) }
}

const discussion: Methods = { GET: thread, HEAD: thread }

const publicItems: Record<string, Methods> = { comments: discussion }

const itemMethods: Record<string, Methods> = { vote: { PUT: account(vote), DELETE: account(unvote) }, status: { PUT: account(move) }, comments: { ...discussion, POST: account(comment) } }

const methodsOf = (env: Env, pathname: string, action: string | undefined) => {
  if (!configured(env)) return action ? publicItems[action] : publicRoutes[pathname]

  return action ? itemMethods[action] : accountRoutes[pathname]
}

const answer = async (call: Call) => {
  const { request, env, url } = call
  const [, id, action] = itemPath.exec(url.pathname) ?? []
  const methods = methodsOf(env, url.pathname, action)
  const handler = methods?.[request.method]

  if (!methods) return notFound()
  if (!handler) return json({ error: 'method not allowed' }, 405, { Allow: Object.keys(methods).join(', ') })
  if (!safe.includes(request.method) && !sameOrigin(request)) return json({ error: 'forbidden' }, 403)

  return handler(call, Number(id ?? 0))
}

const handle = async (request: Request, env: Env, context: Context) => {
  try {
    return await answer({ request, env, context, url: new URL(request.url) })
  } catch (error) {
    console.error('api:', error instanceof Error ? error.message : 'unknown failure')

    return unavailable()
  }
}

export default { fetch: handle }
