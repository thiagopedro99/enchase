import { describe, expect, it } from 'vitest'

import { baseTokens } from '@styles/tokens/base.ts'

describe('motion tokens', () => {
  it('keeps one ease-out curve for every entrance', () => {
    expect(baseTokens.motion.ease.out).toBe('cubic-bezier(0.2, 0, 0, 1)')
  })
})
