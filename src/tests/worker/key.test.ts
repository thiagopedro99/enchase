import { describe, expect, it } from 'vitest'

import { toPkcs8 } from '@worker/key.ts'

import { pkcs1, pkcs8, pkcs8Der } from './defaultData.ts'

describe('Worker key', () => {
  it('wraps the PKCS#1 key that GitHub hands out into the PKCS#8 bytes that WebCrypto reads', () => {
    expect(pkcs1).toContain('BEGIN RSA PRIVATE KEY')
    expect(Array.from(toPkcs8(pkcs1))).toEqual(Array.from(pkcs8Der))
  })

  it('reads a key that is already PKCS#8 as it is', () => {
    expect(pkcs8).toContain('BEGIN PRIVATE KEY')
    expect(Array.from(toPkcs8(pkcs8))).toEqual(Array.from(pkcs8Der))
  })

  it('reads a key that was saved in one line, with the line breaks written out', () => {
    expect(Array.from(toPkcs8(pkcs1.trim().replace(/\n/g, '\\n')))).toEqual(Array.from(pkcs8Der))
  })
})
