import { describe, expect, it } from 'vitest'

import { resolveCssMotion } from '@motion/css.ts'
import { defaultMotionSettings } from '@motion/defaultData.ts'

const settings = defaultMotionSettings

const read = (input: Parameters<typeof resolveCssMotion>[0]) => resolveCssMotion(input) as Record<string, string>

describe('resolveCssMotion', () => {
  it('maps the pop recipe to a duration, a vertical direction, a distance and a scale', () => {
    const style = read({ name: 'pop', component: 'modal', settings })

    expect(style['--enchase-modal-duration']).toBe('200ms')
    expect(style['--enchase-modal-exit-duration']).toBe('140ms')
    expect(style['--enchase-modal-distance']).toBe('12px')
    expect(style['--enchase-modal-dy']).toBe('1')
    expect(style['--enchase-modal-dx']).toBe('0')
    expect(style['--enchase-modal-scale']).toBe('0.96')
  })

  it('lets a component start from its own base tuning, still scaled by the preset and beaten by the settings', () => {
    const base = { duration: 0.4 }
    const plain = read({ name: 'pop', component: 'modal', settings, base })
    const expressive = read({ name: 'pop', component: 'modal', settings: { ...settings, preset: 'expressive' }, base })
    const tuned = read({ name: 'pop', component: 'modal', settings: { ...settings, recipes: { pop: { duration: 0.1 } } }, base })

    expect(plain['--enchase-modal-duration']).toBe('400ms')
    expect(plain['--enchase-modal-scale']).toBe('0.96')
    expect(expressive['--enchase-modal-duration']).toBe('560ms')
    expect(tuned['--enchase-modal-duration']).toBe('100ms')
  })

  it('takes the duration of a spring from its token, scaled by the preset and with a shorter exit', () => {
    const base = { spring: 'gentle' } as const
    const plain = read({ name: 'pop', component: 'modal', settings, base })
    const subtle = read({ name: 'pop', component: 'modal', settings: { ...settings, preset: 'subtle' }, base })
    const tuned = read({ name: 'pop', component: 'modal', settings: { ...settings, recipes: { pop: { duration: 0.1 } } }, base })
    const silent = read({ name: 'pop', component: 'modal', settings, base, override: false })

    expect(plain['--enchase-modal-duration']).toBe('var(--enchase-motion-spring-gentle-duration)')
    expect(plain['--enchase-modal-exit-duration']).toBe('calc(var(--enchase-motion-spring-gentle-duration) * 0.5)')
    expect(subtle['--enchase-modal-duration']).toBe('calc(var(--enchase-motion-spring-gentle-duration) * 0.75)')
    expect(tuned['--enchase-modal-duration']).toBe('100ms')
    expect(silent['--enchase-modal-duration']).toBe('0ms')
  })

  it('names every variable after the component', () => {
    const style = read({ name: 'slide', component: 'toast', settings })

    expect(Object.keys(style).every((key) => key.startsWith('--enchase-toast-'))).toBe(true)
  })

  it('scales duration and distance with the preset', () => {
    const style = read({ name: 'pop', component: 'modal', settings: { ...settings, preset: 'expressive' } })

    expect(style['--enchase-modal-duration']).toBe('280ms')
    expect(style['--enchase-modal-distance']).toBe('19.2px')
  })

  it('goes silent when the animation is false, the mode is never or the preset is off', () => {
    const cases = [
      read({ name: 'pop', component: 'modal', settings, override: false }),
      read({ name: 'pop', component: 'modal', settings: { ...settings, mode: 'never' } }),
      read({ name: 'pop', component: 'modal', settings: { ...settings, preset: 'off' } })
    ]

    for (const style of cases) {
      expect(style['--enchase-modal-duration']).toBe('0ms')
      expect(style['--enchase-modal-distance']).toBe('0px')
      expect(style['--enchase-modal-scale']).toBe('1')
    }
  })

  it('applies a recipe override and per-recipe tuning', () => {
    const fade = read({ name: 'pop', component: 'modal', settings, override: { recipe: 'fade' } })
    const tuned = read({ name: 'pop', component: 'modal', settings, override: { tuning: { duration: 0.5, distance: 20, scale: 0.9 } } })

    expect(fade['--enchase-modal-dy']).toBe('0')
    expect(fade['--enchase-modal-scale']).toBe('1')
    expect(tuned['--enchase-modal-duration']).toBe('500ms')
    expect(tuned['--enchase-modal-distance']).toBe('20px')
    expect(tuned['--enchase-modal-scale']).toBe('0.9')
  })

  it('slides from the logical start and flips it in right to left', () => {
    const ltr = read({ name: 'slide', component: 'sidebar', settings, from: 'left' })
    const rtl = read({ name: 'slide', component: 'sidebar', settings, from: 'left', rtl: true })

    expect(ltr['--enchase-sidebar-dx']).toBe('-1')
    expect(ltr['--enchase-sidebar-distance']).toBe('32px')
    expect(rtl['--enchase-sidebar-dx']).toBe('1')
  })
})
