import { describe, expect, it } from 'vitest'

import { cssVar, variableName } from '@styles/css/names.ts'

describe('variableName', () => {
  it.each([
    [['color', 'primary'], '--enchase-color-primary'],
    [['color', 'onPrimaryContainer'], '--enchase-color-on-primary-container'],
    [['color', 'surfaceContainerLow'], '--enchase-color-surface-container-low'],
    [['color', 'text', 'primary'], '--enchase-color-text-primary'],
    [['color', 'text', 'placeholder'], '--enchase-color-text-placeholder'],
    [['shadow', 'sm'], '--enchase-shadow-sm'],
    [['shadow', 'none'], '--enchase-shadow-none'],
    [['font', 'primary'], '--enchase-font-primary'],
    [['font-size', '2xl'], '--enchase-font-size-2xl'],
    [['font-weight', 'semibold'], '--enchase-font-weight-semibold'],
    [['space', 'md'], '--enchase-space-md'],
    [['radius', 'full'], '--enchase-radius-full'],
    [['transition', 'fast'], '--enchase-transition-fast'],
    [['state', 'pressed'], '--enchase-state-pressed'],
    [['z', 'modal'], '--enchase-z-modal']
  ] as const)('names %j as %s', ([group, ...path], expected) => {
    expect(variableName(group, ...path)).toBe(expected)
  })

  it('turns camel case into kebab case in every part of the path', () => {
    expect(variableName('color', 'inverseOnSurface')).toBe('--enchase-color-inverse-on-surface')
    expect(variableName('color', 'borderStrong')).toBe('--enchase-color-border-strong')
  })
})

describe('cssVar', () => {
  it('wraps the name in var()', () => {
    expect(cssVar('color', 'text', 'primary')).toBe('var(--enchase-color-text-primary)')
    expect(cssVar('font-size', 'base')).toBe('var(--enchase-font-size-base)')
  })
})
