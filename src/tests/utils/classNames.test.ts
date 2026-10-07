import { describe, expect, it } from 'vitest'

import { classNames } from '@utils/classNames.ts'

describe('classNames', () => {
  it('joins the names it receives with a space', () => {
    expect(classNames('a', 'b', 'c')).toBe('a b c')
  })

  it('drops everything that is not a name', () => {
    expect(classNames('a', undefined, null, false, '', 'b')).toBe('a b')
  })

  it('returns an empty string when there is nothing to join', () => {
    expect(classNames()).toBe('')
    expect(classNames(undefined, false)).toBe('')
  })
})
