import { describe, expect, it } from 'vitest'

import { colorReferences, colorVariableName, colorVariables, cssVariablesRule } from '@styles/cssVariables.ts'
import { darkTheme, lightTheme } from '@styles/themes/index.ts'

const leafPaths = (tree: Record<string, unknown>, path: string[] = []): string[] =>
  Object.entries(tree).flatMap(([key, value]) => (typeof value === 'string' ? [[...path, key].join('.')] : leafPaths(value as Record<string, unknown>, [...path, key])))

describe('colorVariableName', () => {
  it.each([
    [['primary'], '--enchase-color-primary'],
    [['onPrimaryContainer'], '--enchase-color-on-primary-container'],
    [['surfaceContainerLow'], '--enchase-color-surface-container-low'],
    [['text', 'primary'], '--enchase-color-text-primary'],
    [['text', 'placeholder'], '--enchase-color-text-placeholder']
  ])('names %j as %s', (path, expected) => {
    expect(colorVariableName(path)).toBe(expected)
  })
})

describe('colorVariables', () => {
  it('creates one variable for every color token of the theme', () => {
    const variables = colorVariables(lightTheme.colors)

    expect(Object.keys(variables)).toHaveLength(leafPaths(lightTheme.colors).length)
    expect(variables['--enchase-color-primary']).toBe(lightTheme.colors.primary)
    expect(variables['--enchase-color-text-secondary']).toBe(lightTheme.colors.text.secondary)
    expect(variables['--enchase-color-overlay']).toBe(lightTheme.colors.overlay)
  })

  it('never reuses a variable name for two different tokens', () => {
    const names = Object.keys(colorVariables(lightTheme.colors))

    expect(new Set(names).size).toBe(names.length)
  })

  it('gives the light and the dark theme exactly the same tokens', () => {
    expect(Object.keys(colorVariables(darkTheme.colors)).sort()).toEqual(Object.keys(colorVariables(lightTheme.colors)).sort())
  })

  it('uses the values of the theme it receives', () => {
    expect(colorVariables(darkTheme.colors)['--enchase-color-primary']).toBe(darkTheme.colors.primary)
    expect(darkTheme.colors.primary).not.toBe(lightTheme.colors.primary)
  })
})

describe('colorReferences', () => {
  const references = colorReferences(lightTheme.colors)

  it('keeps the shape of the color tokens', () => {
    expect(leafPaths(references)).toEqual(leafPaths(lightTheme.colors))
  })

  it('points every token to its own variable', () => {
    expect(references.primary).toBe('var(--enchase-color-primary)')
    expect(references.onPrimaryContainer).toBe('var(--enchase-color-on-primary-container)')
    expect(references.text.primary).toBe('var(--enchase-color-text-primary)')
  })

  it('references only variables that exist in both themes', () => {
    const lightNames = new Set(Object.keys(colorVariables(lightTheme.colors)))
    const darkNames = new Set(Object.keys(colorVariables(darkTheme.colors)))
    const used = leafPaths(references).map((path) => path.split('.').reduce<unknown>((value, key) => (value as Record<string, unknown>)[key], references) as string)

    for (const reference of used) {
      const name = reference.replace(/^var\((.*)\)$/, '$1')

      expect(lightNames.has(name)).toBe(true)
      expect(darkNames.has(name)).toBe(true)
    }
  })

  it('is the same for the light and the dark theme, so switching modes does not change it', () => {
    expect(colorReferences(darkTheme.colors)).toEqual(references)
  })

  it('does not change the theme it receives', () => {
    expect(lightTheme.colors.primary).toBe('#4F46E5')
  })
})

describe('cssVariablesRule', () => {
  it('writes a rule with one declaration per token, for the given selector', () => {
    const rule = cssVariablesRule(':root', lightTheme.colors)

    expect(rule.startsWith(':root {\n')).toBe(true)
    expect(rule.endsWith('\n}')).toBe(true)
    expect(rule).toContain(`  --enchase-color-primary: ${lightTheme.colors.primary};`)
    expect(rule).toContain(`  --enchase-color-text-primary: ${lightTheme.colors.text.primary};`)
    expect(rule.split('\n').filter((line) => line.startsWith('  --'))).toHaveLength(Object.keys(colorVariables(lightTheme.colors)).length)
  })

  it('writes the dark values under the selector it is given', () => {
    const rule = cssVariablesRule("[data-theme='dark']", darkTheme.colors)

    expect(rule.startsWith("[data-theme='dark'] {\n")).toBe(true)
    expect(rule).toContain(`  --enchase-color-background: ${darkTheme.colors.background};`)
  })
})
