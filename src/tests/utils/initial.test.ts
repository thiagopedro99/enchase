import { describe, expect, it } from 'vitest'

import { initialOf, initialsOf } from '@utils/initial.ts'

describe('initialOf', () => {
  it.each([
    ['dana', 'D'],
    ['Ólafur Darri Ólafsson', 'Ó'],
    ['  Sam   Lee ', 'S'],
    ['J', 'J'],
    ['王秀英', '王'],
    ['نور الهدى عبد الرحمن', 'ن'],
    ['🦊 Fox', '🦊'],
    ['👩🏽‍💻 Priya', '👩🏽‍💻']
  ])('takes a whole letter or emoji from %s', (name, expected) => {
    expect(initialOf(name)).toBe(expected)
  })

  it('never returns half of a surrogate pair', () => {
    expect(initialOf('🦊 Fox')).not.toMatch(/^[\uD800-\uDBFF]$/)
  })

  it('falls back when there is no name', () => {
    expect(initialOf('')).toBe('?')
    expect(initialOf('   ')).toBe('?')
    expect(initialOf('', '•')).toBe('•')
  })
})

describe('initialsOf', () => {
  it.each([
    ['Ana Souza', 'AS'],
    ['ana', 'A'],
    ['  Sam   Lee ', 'SL'],
    ['Maria de Fátima Souza', 'MS'],
    ['Ólafur Darri Ólafsson', 'ÓÓ'],
    ['王秀英', '王'],
    ['نور الهدى عبد الرحمن', 'نا'],
    ['🦊 Fox', '🦊F'],
    ['👩🏽‍💻 Priya', '👩🏽‍💻P']
  ])('takes the first letter of the first and of the last word of %s', (name, expected) => {
    expect(initialsOf(name)).toBe(expected)
  })

  it('never returns half of a surrogate pair', () => {
    expect(initialsOf('🦊 🦝')).not.toMatch(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/)
    expect(initialsOf('🦊 🦝')).toBe('🦊🦝')
  })

  it('falls back when there is no name', () => {
    expect(initialsOf('')).toBe('?')
    expect(initialsOf('   ')).toBe('?')
    expect(initialsOf('', '•')).toBe('•')
  })
})
