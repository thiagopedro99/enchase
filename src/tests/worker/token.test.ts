import { verify } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { forget, tokenFor } from '@worker/token.ts'

import { callsTo, env, github, headerOf, hour, installationEndpoint, pkcs8, publicKey, refused, start, tokenEndpoint } from './defaultData.ts'

const decode = (part: string) => JSON.parse(Buffer.from(part, 'base64url').toString())

const jwtOf = (fetcher: ReturnType<typeof github>, url = installationEndpoint) => headerOf(fetcher, url, 'Authorization').replace('Bearer ', '')

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(start)
  forget()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('Worker token', () => {
  it('signs as the app with a short JWT that the public key of the app verifies', async () => {
    const fetcher = github()

    vi.stubGlobal('fetch', fetcher)

    expect(await tokenFor(env)).toBe('ghs_token1')

    const [header = '', payload = '', signature = ''] = jwtOf(fetcher).split('.')
    const now = start / 1000

    expect(decode(header)).toEqual({ alg: 'RS256', typ: 'JWT' })
    expect(decode(payload)).toEqual({ iat: now - 60, exp: now + 540, iss: '424242' })
    expect(verify('RSA-SHA256', Buffer.from(`${header}.${payload}`), publicKey, Buffer.from(signature, 'base64url'))).toBe(true)
    expect(jwtOf(fetcher, tokenEndpoint)).toBe(jwtOf(fetcher))
  })

  it('signs with a PKCS#8 key too', async () => {
    const fetcher = github()

    vi.stubGlobal('fetch', fetcher)
    await tokenFor({ ...env, GITHUB_APP_PRIVATE_KEY: pkcs8 })

    const [header = '', payload = '', signature = ''] = jwtOf(fetcher).split('.')

    expect(verify('RSA-SHA256', Buffer.from(`${header}.${payload}`), publicKey, Buffer.from(signature, 'base64url'))).toBe(true)
  })

  it('asks for a token that only reads the issues of this repository, and says who is asking', async () => {
    const fetcher = github()

    vi.stubGlobal('fetch', fetcher)
    await tokenFor(env)

    const [, init] = callsTo(fetcher, tokenEndpoint)[0] ?? []

    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual({ repositories: ['enchase'], permissions: { issues: 'read' } })
    expect(headerOf(fetcher, tokenEndpoint, 'User-Agent')).toBe('enchase-suggestions')
    expect(headerOf(fetcher, installationEndpoint, 'Accept')).toBe('application/vnd.github+json')
  })

  it('keeps the token until five minutes before it expires', async () => {
    const fetcher = github()

    vi.stubGlobal('fetch', fetcher)
    await tokenFor(env)
    vi.setSystemTime(start + hour - 6 * 60 * 1000)

    expect(await tokenFor(env)).toBe('ghs_token1')
    expect(callsTo(fetcher, tokenEndpoint)).toHaveLength(1)

    vi.setSystemTime(start + hour - 4 * 60 * 1000)

    expect(await tokenFor(env)).toBe('ghs_token2')
    expect(callsTo(fetcher, installationEndpoint)).toHaveLength(2)
  })

  it('asks once when two requests arrive together', async () => {
    const fetcher = github()

    vi.stubGlobal('fetch', fetcher)

    expect(await Promise.all([tokenFor(env), tokenFor(env)])).toEqual(['ghs_token1', 'ghs_token1'])
    expect(callsTo(fetcher, tokenEndpoint)).toHaveLength(1)
  })

  it('asks again after the token was forgotten', async () => {
    const fetcher = github()

    vi.stubGlobal('fetch', fetcher)
    await tokenFor(env)
    forget()

    expect(await tokenFor(env)).toBe('ghs_token2')
  })

  it.each([
    ['the installation', installationEndpoint, 'github answered 404 to /repos'],
    ['the token', tokenEndpoint, 'github answered 403 to /app']
  ])('fails when GitHub refuses %s, and tries again on the next request', async (_name, url, message) => {
    const fetcher = github({ [url]: refused(url === tokenEndpoint ? 403 : 404) })

    vi.stubGlobal('fetch', fetcher)

    await expect(tokenFor(env)).rejects.toThrow(message)

    vi.stubGlobal('fetch', github())

    expect(await tokenFor(env)).toBe('ghs_token1')
  })

  it('fails on a key that is not a key', async () => {
    vi.stubGlobal('fetch', github())

    await expect(tokenFor({ ...env, GITHUB_APP_PRIVATE_KEY: '-----BEGIN RSA PRIVATE KEY-----\nAAAA\n-----END RSA PRIVATE KEY-----' })).rejects.toThrow()
  })
})
