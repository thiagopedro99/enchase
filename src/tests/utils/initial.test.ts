import { describe, expect, it } from 'vitest'

import { initialOf } from '@utils/initial.ts'

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
