import { defaultMotionSettings } from '@motion/defaultData.ts'
import { resolveRecipe } from '@motion/recipes.ts'
import { describe, expect, it } from 'vitest'

import type { MotionSettings } from '@motion/types.ts'

const settings = (overrides: Partial<MotionSettings> = {}): MotionSettings => ({ ...defaultMotionSettings, ...overrides })

describe('resolveRecipe', () => {
  it('builds a pop recipe with enter and exit states', () => {
    const recipe = resolveRecipe({ name: 'pop', settings: settings(), prefersReduced: false })

    expect(recipe.initial).toEqual({ opacity: 0, scale: 0.96, y: 12 })
    expect(recipe.animate).toEqual({ opacity: 1, scale: 1, y: 0 })
    expect(recipe.exit).toEqual({ opacity: 0, scale: 0.96, y: 12 })
  })

  it('slides in from the requested side', () => {
    const right = resolveRecipe({ name: 'slide', settings: settings(), prefersReduced: false, from: 'right' })
    const top = resolveRecipe({ name: 'slide', settings: settings(), prefersReduced: false, from: 'top' })

    expect(right.initial).toEqual({ opacity: 0, x: 32 })
    expect(top.initial).toEqual({ opacity: 0, y: -32 })
  })

  it('scales duration and distance by preset', () => {
    const subtle = resolveRecipe({ name: 'slide', settings: settings({ preset: 'subtle' }), prefersReduced: false, from: 'right' })
    const expressive = resolveRecipe({ name: 'slide', settings: settings({ preset: 'expressive' }), prefersReduced: false, from: 'right' })

    expect(subtle.initial).toMatchObject({ x: 16 })
    expect(expressive.initial).toMatchObject({ x: 51.2 })
    expect((subtle.transition as { duration: number }).duration).toBeLessThan((expressive.transition as { duration: number }).duration)
  })

  it('applies per-recipe tuning from settings and explicit override with precedence', () => {
    const fromSettings = resolveRecipe({ name: 'pop', settings: settings({ recipes: { pop: { duration: 0.5, distance: 40 } } }), prefersReduced: false })
    const fromOverride = resolveRecipe({
      name: 'pop',
      settings: settings({ recipes: { pop: { duration: 0.5 } } }),
      prefersReduced: false,
      tuning: { duration: 0.9 }
    })

    expect(fromSettings.initial).toMatchObject({ y: 40 })
    expect((fromSettings.transition as { duration: number }).duration).toBe(0.5)
    expect((fromOverride.transition as { duration: number }).duration).toBe(0.9)
  })

  it('renders final state instantly when preset is off, mode is never or disabled', () => {
    const off = resolveRecipe({ name: 'pop', settings: settings({ preset: 'off' }), prefersReduced: false })
    const never = resolveRecipe({ name: 'slide', settings: settings({ mode: 'never' }), prefersReduced: false })
    const disabled = resolveRecipe({ name: 'fade', settings: settings(), prefersReduced: false, disabled: true })

    for (const recipe of [off, never, disabled]) {
      expect(recipe.initial).toBe(false)
      expect(recipe.transition).toEqual({ duration: 0 })
      expect(recipe.exit).toEqual(recipe.animate)
    }
  })

  it('drops interactive and loop recipes when silent', () => {
    expect(resolveRecipe({ name: 'press', settings: settings({ preset: 'off' }), prefersReduced: false })).toEqual({})
    expect(resolveRecipe({ name: 'spin', settings: settings({ mode: 'never' }), prefersReduced: false })).toEqual({})
  })

  it('keeps only opacity fades for transient recipes under reduced motion', () => {
    for (const name of ['pop', 'slide', 'fade'] as const) {
      const recipe = resolveRecipe({ name, settings: settings(), prefersReduced: true })

      expect(recipe.initial).toEqual({ opacity: 0 })
      expect(recipe.animate).toEqual({ opacity: 1 })
    }
  })

  it('removes press and lift under reduced motion', () => {
    expect(resolveRecipe({ name: 'press', settings: settings(), prefersReduced: true })).toEqual({})
    expect(resolveRecipe({ name: 'lift', settings: settings(), prefersReduced: true })).toEqual({})
  })

  it('replaces spin and shimmer by an opacity pulse under reduced motion', () => {
    for (const name of ['spin', 'shimmer'] as const) {
      const recipe = resolveRecipe({ name, settings: settings(), prefersReduced: true })

      expect(recipe.animate).toEqual({ opacity: [1, 0.5, 1] })
      expect(JSON.stringify(recipe.animate)).not.toContain('rotate')
    }
  })

  it('runs loops infinitely and independently of preset duration scale', () => {
    const subtle = resolveRecipe({ name: 'spin', settings: settings({ preset: 'subtle' }), prefersReduced: false })
    const expressive = resolveRecipe({ name: 'spin', settings: settings({ preset: 'expressive' }), prefersReduced: false })

    expect(subtle.animate).toEqual({ rotate: 360 })
    expect(subtle.transition).toMatchObject({ repeat: Infinity, duration: 0.8 })
    expect(expressive.transition).toMatchObject({ repeat: Infinity, duration: 0.8 })
  })

  it('resizes with a transition only and completes instantly when motion is reduced or off', () => {
    const normal = resolveRecipe({ name: 'resize', settings: settings(), prefersReduced: false })
    const reduced = resolveRecipe({ name: 'resize', settings: settings(), prefersReduced: true })
    const off = resolveRecipe({ name: 'resize', settings: settings({ preset: 'off' }), prefersReduced: false })

    expect(normal.initial).toBeUndefined()
    expect(normal.animate).toBeUndefined()
    expect((normal.transition as { duration: number }).duration).toBe(0.25)
    expect(reduced.transition).toMatchObject({ duration: 0 })
    expect(off.transition).toMatchObject({ duration: 0 })
  })

  it('exposes press and lift as gesture props', () => {
    const press = resolveRecipe({ name: 'press', settings: settings(), prefersReduced: false })
    const lift = resolveRecipe({ name: 'lift', settings: settings(), prefersReduced: false })

    expect(press.whileTap).toEqual({ scale: 0.97 })
    expect(lift.whileHover).toEqual({ y: -2 })
  })
})
