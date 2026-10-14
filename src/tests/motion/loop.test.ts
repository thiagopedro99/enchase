import { describe, expect, it } from 'vitest'

import { defaultMotionSettings } from '@motion/defaultData.ts'
import { resolveLoopMotion } from '@motion/loop.ts'

describe('resolveLoopMotion', () => {
  it('runs with the css default duration under the standard preset', () => {
    expect(resolveLoopMotion('spin', defaultMotionSettings)).toEqual({ motion: 'on', style: undefined })
  })

  it('is off when disabled, never or the preset is off', () => {
    expect(resolveLoopMotion('spin', defaultMotionSettings, false).motion).toBe('off')
    expect(resolveLoopMotion('shimmer', { ...defaultMotionSettings, mode: 'never' }).motion).toBe('off')
    expect(resolveLoopMotion('shimmer', { ...defaultMotionSettings, preset: 'off' }).motion).toBe('off')
  })

  it('is off when the override asks for another recipe', () => {
    expect(resolveLoopMotion('spin', defaultMotionSettings, { recipe: 'fade' }).motion).toBe('off')
  })

  it('scales the duration by preset and lets the override tuning win', () => {
    expect(resolveLoopMotion('spin', { ...defaultMotionSettings, preset: 'expressive' }).style).toEqual({ '--enchase-spinner-duration': '1120ms' })
    expect(resolveLoopMotion('shimmer', defaultMotionSettings, { tuning: { duration: 2 } }).style).toEqual({ '--enchase-shimmer-duration': '2000ms' })
    expect(resolveLoopMotion('spin', { ...defaultMotionSettings, recipes: { spin: { duration: 0.5 } } }, { tuning: { duration: 1 } }).style).toEqual({ '--enchase-spinner-duration': '1000ms' })
  })
})
