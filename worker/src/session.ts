import { base64url, bytesOf, fromBase64url, hex, random, sha256 } from './encoding.ts'
import { cookie, cookieOf } from './http.ts'

import type { Account, Session, User } from './types.ts'

const cookieName = '__Host-enchase-session'

const life = 8 * 60 * 60

const shortest = 60

const ivSize = 12

const keyOf = async (id: string) => `session:${hex(await sha256(id))}`

const cipherOf = async (id: string) => {
  const material = await crypto.subtle.importKey('raw', bytesOf(id), 'HKDF', false, ['deriveKey'])

  return crypto.subtle.deriveKey({ name: 'HKDF', hash: 'SHA-256', salt: new Uint8Array(0), info: bytesOf('enchase-session') }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}

const seal = async (id: string, token: string) => {
  const iv = crypto.getRandomValues(new Uint8Array(ivSize))
  const sealed = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await cipherOf(id), bytesOf(token)))

  return `${base64url(iv)}.${base64url(sealed)}`
}

const unseal = async (id: string, sealed: string) => {
  const [iv = '', data = ''] = sealed.split('.')
  const opened = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromBase64url(iv) }, await cipherOf(id), fromBase64url(data))

  return new TextDecoder().decode(opened)
}

export const sessionCookie = (id: string, maxAge: number) => cookie(cookieName, id, maxAge)

export const noSessionCookie = () => cookie(cookieName, '', 0)

export const createSession = async ({ SESSIONS }: Account, user: User, token: string, expiresIn = life) => {
  const id = random(32)
  const seconds = Math.max(shortest, Math.min(life, Math.floor(expiresIn)))

  await SESSIONS.put(await keyOf(id), JSON.stringify({ user, token: await seal(id, token), expires: Date.now() + seconds * 1000 }), { expirationTtl: seconds })

  return sessionCookie(id, seconds)
}

export const readSession = async (request: Request, { SESSIONS }: Account): Promise<Session | null> => {
  const id = cookieOf(request, cookieName)

  if (!id || !/^[A-Za-z0-9_-]{43}$/.test(id)) return null

  try {
    const stored = await SESSIONS.get(await keyOf(id))
    const { user, token, expires }: { user: User; token: string; expires: number } = stored ? JSON.parse(stored) : { expires: 0 }

    return expires > Date.now() ? { id, user, token: await unseal(id, token) } : null
  } catch {
    return null
  }
}

export const endSession = async ({ SESSIONS }: Account, id: string) => SESSIONS.delete(await keyOf(id))
