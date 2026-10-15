import { describe, expect, it } from 'vitest'

import { globalStylesCss } from '@styles/css/global.ts'

describe('global styles', () => {
  it('does not animate the scroll of keyboard jumps', () => {
    expect(globalStylesCss).not.toContain('scroll-behavior')
  })

  it('keeps the looping motion alive under reduced motion', () => {
    expect(globalStylesCss).toContain("[data-motion='on']")
  })
})
