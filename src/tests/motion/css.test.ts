import { describe, expect, it } from 'vitest'

import { exitMilliseconds, resolveCssMotion } from '@motion/css.ts'
import { defaultMotionSettings } from '@motion/defaultData.ts'

const settings = defaultMotionSettings

describe('resolveCssMotion', () => {
  it('maps the pop recipe to a duration, a vertical offset and a scale', () => {
    const style = resolveCssMotion({ name: 'pop', settings }) as Record<string, string>

    expect(style['--enchase-presence-duration']).toBe('200ms')
    expect(style['--enchase-presence-exit-duration']).toBe('140ms')
    expect(style['--enchase-presence-y']).toBe('12px')
    expect(style['--enchase-presence-x']).toBe('0px')
    expect(style['--enchase-presence-scale']).toBe('0.96')
  })

  it('scales duration and distance with the preset', () => {
    const style = resolveCssMotion({ name: 'pop', settings: { ...settings, preset: 'expressive' } }) as Record<string, string>

    expect(style['--enchase-presence-duration']).toBe('280ms')
    expect(style['--enchase-presence-y']).toBe('19.2px')
  })

  it('goes silent when the animation is false, the mode is never or the preset is off', () => {
    const cases = [
      resolveCssMotion({ name: 'pop', settings, override: false }),
      resolveCssMotion({ name: 'pop', settings: { ...settings, mode: 'never' } }),
      resolveCssMotion({ name: 'pop', settings: { ...settings, preset: 'off' } })
    ]

    for (const style of cases as Record<string, string>[]) {
      expect(style['--enchase-presence-duration']).toBe('0ms')
      expect(style['--enchase-presence-y']).toBe('0px')
      expect(style['--enchase-presence-scale']).toBe('1')
    }
  })

  it('applies a recipe override and per-recipe tuning', () => {
    const fade = resolveCssMotion({ name: 'pop', settings, override: { recipe: 'fade' } }) as Record<string, string>
    const tuned = resolveCssMotion({ name: 'pop', settings, override: { tuning: { duration: 0.5, distance: 20, scale: 0.9 } } }) as Record<string, string>

    expect(fade['--enchase-presence-y']).toBe('0px')
    expect(fade['--enchase-presence-scale']).toBe('1')
    expect(tuned['--enchase-presence-duration']).toBe('500ms')
    expect(tuned['--enchase-presence-y']).toBe('20px')
    expect(tuned['--enchase-presence-scale']).toBe('0.9')
  })

  it('slides from the logical start and flips it in right to left', () => {
    const ltr = resolveCssMotion({ name: 'slide', settings, from: 'left' }) as Record<string, string>
    const rtl = resolveCssMotion({ name: 'slide', settings, from: 'left', rtl: true }) as Record<string, string>

    expect(ltr['--enchase-presence-x']).toBe('-32px')
    expect(rtl['--enchase-presence-x']).toBe('32px')
  })

  it('reads the exit duration back in milliseconds', () => {
    expect(exitMilliseconds(resolveCssMotion({ name: 'pop', settings }))).toBe(140)
  })
})
