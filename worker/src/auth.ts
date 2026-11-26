import { createSession, endSession, noSessionCookie, readSession } from './session.ts'
import { cookie, cookieOf, json, redirect } from './http.ts'
import { base64url, random, sha256 } from './encoding.ts'
import { exchange, forgetPermission, revoke, userOf } from './github.ts'

import type { AccountHandler } from './types.ts'

const cookieName = '__Host-enchase-login'

const loginLife = 10 * 60

const authorizeEndpoint = 'https://github.com/login/oauth/authorize'

const page = '/sugestoes'

const failed = `${page}?login=failed`

const noLoginCookie = () => cookie(cookieName, '', 0)

const callbackOf = ({ origin }: URL) => `${origin}/api/auth/callback`

export const login: AccountHandler = async ({ env, url }) => {
  const state = random(16)
  const verifier = random(32)
  const target = new URL(authorizeEndpoint)

  target.searchParams.set('client_id', env.GITHUB_CLIENT_ID)
  target.searchParams.set('redirect_uri', callbackOf(url))
  target.searchParams.set('state', state)
  target.searchParams.set('code_challenge', base64url(await sha256(verifier)))
  target.searchParams.set('code_challenge_method', 'S256')

  return redirect(target.href, [cookie(cookieName, `${state}.${verifier}`, loginLife)])
}

export const callback: AccountHandler = async ({ request, env, url }) => {
  const [state = '', verifier = ''] = (cookieOf(request, cookieName) ?? '').split('.')
  const code = url.searchParams.get('code') ?? ''

  if (url.searchParams.get('error') === 'access_denied') return redirect(page, [noLoginCookie()])
  if (state === '' || verifier === '' || code === '' || url.searchParams.get('state') !== state) return redirect(failed, [noLoginCookie()])

  const allowed = await env.LIMITER.limit({ key: `login:${request.headers.get('CF-Connecting-IP') ?? ''}` })

  if (!allowed.success) return redirect(failed, [noLoginCookie()])

  const granted = await exchange(env, code, verifier, callbackOf(url))
  const user = granted ? await userOf(granted.token) : null

  if (!granted || !user) return redirect(failed, [noLoginCookie()])

  return redirect(page, [noLoginCookie(), await createSession(env, user, granted.token, granted.expiresIn)])
}

export const logout: AccountHandler = async ({ request, env, context }) => {
  const session = await readSession(request, env)

  if (session) {
    forgetPermission(session.user.id)
    await endSession(env, session.id)
    context.waitUntil(revoke(env, session.token).catch(() => undefined))
  }

  return json({ user: null }, 200, {}, [noSessionCookie()])
}
