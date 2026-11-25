import { repository } from '../../demo/pages/sugestoes/github.ts'
import { base64url, bytesOf } from './encoding.ts'
import { toPkcs8 } from './key.ts'

import type { Env, Held } from './types.ts'

export const api = 'https://api.github.com'

const margin = 5 * 60 * 1000

const algorithm = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }

export const githubHeaders = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'enchase-suggestions' }

const state: { held: Held | null; pending: Promise<Held> | null } = { held: null, pending: null }

const encodeJson = (value: object) => base64url(bytesOf(JSON.stringify(value)))

const sign = async ({ GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY }: Env) => {
  const key = await crypto.subtle.importKey('pkcs8', toPkcs8(GITHUB_APP_PRIVATE_KEY), algorithm, false, ['sign'])
  const now = Math.floor(Date.now() / 1000)
  const unsigned = `${encodeJson({ alg: 'RS256', typ: 'JWT' })}.${encodeJson({ iat: now - 60, exp: now + 540, iss: GITHUB_APP_ID })}`
  const signature = await crypto.subtle.sign(algorithm.name, key, bytesOf(unsigned))

  return `${unsigned}.${base64url(new Uint8Array(signature))}`
}

const ask = async (path: string, bearer: string, init: RequestInit = {}) => {
  const response = await fetch(`${api}${path}`, { ...init, headers: { ...githubHeaders, Authorization: `Bearer ${bearer}` } })

  if (!response.ok) throw new Error(`github answered ${response.status} to ${path.split('/').slice(0, 2).join('/')}`)

  return response.json()
}

const mint = async (env: Env): Promise<Held> => {
  const bearer = await sign(env)
  const { id }: { id: number } = await ask(`/repos/${repository}/installation`, bearer)
  const scope = { repositories: [repository.slice(repository.indexOf('/') + 1)], permissions: { issues: 'read' } }
  const { token, expires_at }: { token: string; expires_at: string } = await ask(`/app/installations/${id}/access_tokens`, bearer, { method: 'POST', body: JSON.stringify(scope) })

  return { token, expires: Date.parse(expires_at) }
}

export const forget = () => {
  state.held = null
}

export const tokenFor = async (env: Env) => {
  if (state.held && state.held.expires - margin > Date.now()) return state.held.token

  state.pending ??= mint(env).finally(() => {
    state.pending = null
  })
  state.held = await state.pending

  return state.held.token
}
