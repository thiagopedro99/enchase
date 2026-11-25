import worker from '@worker/index.ts'

import { cookiesOf, site, valueOf } from './defaultData.ts'

import type { accountEnv } from './defaultData.ts'

export const background: Promise<unknown>[] = []

export const context = { waitUntil: (promise: Promise<unknown>) => void background.push(promise) }

export const settle = () => Promise.all(background.splice(0))

export const sessionName = '__Host-enchase-session'

export const loginName = '__Host-enchase-login'

export const call = async (env: ReturnType<typeof accountEnv>, path: string, init: RequestInit & { cookie?: string; origin?: string | null } = {}) => {
  const { cookie, origin = site, ...rest } = init
  const headers = new Headers(rest.headers)
  const unsafe = !['GET', 'HEAD'].includes(rest.method ?? 'GET')

  if (cookie) headers.set('Cookie', cookie)
  if (unsafe && origin) headers.set('Origin', origin)

  const response = await worker.fetch(new Request(`${site}${path}`, { ...rest, headers }), env, context)

  await settle()

  return response
}

export const start = async (env: ReturnType<typeof accountEnv>) => {
  const response = await call(env, '/api/auth/login')
  const target = new URL(response.headers.get('Location') ?? '')
  const cookie = cookiesOf(response)[loginName] ?? ''

  return { response, target, cookie, pair: `${loginName}=${valueOf(cookie)}`, state: target.searchParams.get('state') ?? '' }
}

export const signIn = async (env: ReturnType<typeof accountEnv>) => {
  const { pair, state } = await start(env)
  const response = await call(env, `/api/auth/callback?code=the-code&state=${state}`, { cookie: pair })
  const cookie = cookiesOf(response)[sessionName] ?? ''

  return { response, cookie, id: valueOf(cookie), pair: `${sessionName}=${valueOf(cookie)}` }
}
