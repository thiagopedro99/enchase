import { describe, expect, it } from 'vitest'

import { themeCss } from '@styles/css/declarations.ts'
import { createTheme } from '@styles/theme/createTheme.ts'

describe('spring tokens in the theme css', () => {
  it('declares the duration of every spring next to its easing', () => {
    const css = themeCss(createTheme())

    for (const name of ['gentle', 'snappy', 'bouncy']) {
      expect(css).toContain(`--enchase-motion-spring-${name}:`)
      expect(css).toMatch(new RegExp(`--enchase-motion-spring-${name}-duration:\\s*\\d+ms`))
    }
  })

  it('follows a custom spring duration', () => {
    expect(themeCss(createTheme({ motion: { spring: { snappy: { duration: '220ms', bounce: 0.2 } } } }))).toContain('--enchase-motion-spring-snappy-duration: 220ms')
  })
})
