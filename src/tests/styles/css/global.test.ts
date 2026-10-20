import { describe, expect, it } from 'vitest'

import { globalStylesCss } from '@styles/css/global.ts'

describe('global styles', () => {
  it('does not animate the scroll of keyboard jumps', () => {
    expect(globalStylesCss).not.toContain('scroll-behavior')
  })

  it('keeps the looping motion alive under reduced motion', () => {
    expect(globalStylesCss).toContain("[data-motion='on']")
  })

  it('draws the focus ring from the focus tokens, in the color of the theme unless the caller sets one', () => {
    expect(globalStylesCss).toContain('outline: var(--enchase-focus-width) solid var(--enchase-focus-color, var(--enchase-color-primary));')
    expect(globalStylesCss).toContain('outline-offset: var(--enchase-focus-offset);')
  })
})
