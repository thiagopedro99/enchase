import { describe, expect, it } from 'vitest'

import { en, ptBR } from '@locales/index.ts'

describe('locales', () => {
  it('has the same message keys in every locale', () => {
    expect(Object.keys(ptBR.messages).sort()).toEqual(Object.keys(en.messages).sort())
  })

  it('has no empty message', () => {
    for (const locale of [en, ptBR]) {
      for (const [key, value] of Object.entries(locale.messages)) {
        expect(value.trim(), `${locale.locale}.${key}`).not.toBe('')
      }
    }
  })

  it('declares a language tag and a direction', () => {
    expect(en).toMatchObject({ locale: 'en', dir: 'ltr' })
    expect(ptBR).toMatchObject({ locale: 'pt-BR', dir: 'ltr' })
  })
})
