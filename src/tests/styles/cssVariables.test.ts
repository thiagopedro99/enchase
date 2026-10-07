import { describe, expect, it } from 'vitest'

import {
  colorReferences,
  colorVariableName,
  colorVariables,
  cssVariablesRule,
  fontFamilyVariableName,
  fontReferences,
  fontSizeVariableName,
  fontVariables,
  fontVariablesRule,
  fontWeightVariableName,
  shadowReferences,
  shadowVariableName,
  shadowVariables,
  themeReferences,
  themeVariables
} from '@styles/cssVariables.ts'
import { darkTheme, lightTheme } from '@styles/themes/index.ts'

const leafPaths = (tree: Record<string, unknown>, path: string[] = []): string[] =>
  Object.entries(tree).flatMap(([key, value]) => (typeof value === 'string' ? [[...path, key].join('.')] : leafPaths(value as Record<string, unknown>, [...path, key])))

const variableNamesIn = (value: string) => [...value.matchAll(/var\((--[a-z0-9-]+)\)/g)].map((match) => match[1])

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

describe('shadowVariableName', () => {
  it.each([
    ['sm', '--enchase-shadow-sm'],
    ['xl', '--enchase-shadow-xl'],
    ['none', '--enchase-shadow-none']
  ])('names %s as %s', (key, expected) => {
    expect(shadowVariableName(key)).toBe(expected)
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
    const names = Object.keys(themeVariables(lightTheme))

    expect(new Set(names).size).toBe(names.length)
  })

  it('gives the light and the dark theme exactly the same tokens', () => {
    expect(Object.keys(themeVariables(darkTheme)).sort()).toEqual(Object.keys(themeVariables(lightTheme)).sort())
  })

  it('uses the values of the theme it receives', () => {
    expect(colorVariables(darkTheme.colors)['--enchase-color-primary']).toBe(darkTheme.colors.primary)
    expect(darkTheme.colors.primary).not.toBe(lightTheme.colors.primary)
  })
})

describe('shadowVariables', () => {
  it('creates one variable for every shadow of the theme, with its own value', () => {
    const variables = shadowVariables(darkTheme.shadows)

    expect(Object.keys(variables)).toHaveLength(Object.keys(darkTheme.shadows).length)
    expect(variables['--enchase-shadow-md']).toBe(darkTheme.shadows.md)
    expect(variables['--enchase-shadow-none']).toBe('none')
  })
})

describe('font variable names', () => {
  it('names families, sizes and weights without clashing', () => {
    expect(fontFamilyVariableName('primary')).toBe('--enchase-font-primary')
    expect(fontFamilyVariableName('mono')).toBe('--enchase-font-mono')
    expect(fontSizeVariableName('base')).toBe('--enchase-font-size-base')
    expect(fontSizeVariableName('2xl')).toBe('--enchase-font-size-2xl')
    expect(fontWeightVariableName('semibold')).toBe('--enchase-font-weight-semibold')
  })
})

describe('fontVariables', () => {
  const variables = fontVariables(lightTheme.fonts)

  it('creates one variable for every family, size and weight', () => {
    const expected = 2 + Object.keys(lightTheme.fonts.sizes).length + Object.keys(lightTheme.fonts.weights).length

    expect(Object.keys(variables)).toHaveLength(expected)
  })

  it('keeps the values, writing weights as text', () => {
    expect(variables['--enchase-font-primary']).toBe(lightTheme.fonts.primary)
    expect(variables['--enchase-font-mono']).toBe(lightTheme.fonts.mono)
    expect(variables['--enchase-font-size-base']).toBe(lightTheme.fonts.sizes.base)
    expect(variables['--enchase-font-weight-bold']).toBe('700')
  })

  it('does not reuse a name of the color or shadow variables', () => {
    const colorAndShadowNames = new Set(Object.keys(themeVariables(lightTheme)))

    for (const name of Object.keys(variables)) expect(colorAndShadowNames.has(name)).toBe(false)
  })
})

describe('fontReferences', () => {
  const references = fontReferences(lightTheme.fonts)

  it('points every font token to its own variable, keeping the shape', () => {
    expect(references.primary).toBe('var(--enchase-font-primary)')
    expect(references.mono).toBe('var(--enchase-font-mono)')
    expect(references.sizes.base).toBe('var(--enchase-font-size-base)')
    expect(Object.keys(references.sizes)).toEqual(Object.keys(lightTheme.fonts.sizes))
    expect(references.weights.semibold).toBe('var(--enchase-font-weight-semibold)')
    expect(Object.keys(references.weights)).toEqual(Object.keys(lightTheme.fonts.weights))
  })
})

describe('what is allowed to change between the light and the dark theme', () => {
  it('differs only in colors and shadows, which are the parts turned into variables', () => {
    const rest = (theme: Record<string, unknown>) => Object.fromEntries(Object.entries(theme).filter(([key]) => key !== 'colors' && key !== 'shadows'))

    expect(rest(darkTheme)).toEqual(rest(lightTheme))
  })
})

describe('colorReferences and shadowReferences', () => {
  const references = colorReferences(lightTheme.colors)

  it('keeps the shape of the color tokens', () => {
    expect(leafPaths(references)).toEqual(leafPaths(lightTheme.colors))
  })

  it('points every token to its own variable', () => {
    expect(references.primary).toBe('var(--enchase-color-primary)')
    expect(references.onPrimaryContainer).toBe('var(--enchase-color-on-primary-container)')
    expect(references.text.primary).toBe('var(--enchase-color-text-primary)')
    expect(shadowReferences(lightTheme.shadows).md).toBe('var(--enchase-shadow-md)')
  })

  it('does not change the theme it receives', () => {
    expect(lightTheme.colors.primary).toBe('#4F46E5')
  })
})

describe('themeReferences', () => {
  const light = themeReferences(lightTheme)

  it('references only variables that exist in both themes', () => {
    const lightNames = new Set(Object.keys(themeVariables(lightTheme)))
    const darkNames = new Set(Object.keys(themeVariables(darkTheme)))
    const names = [...variableNamesIn(JSON.stringify(light.colors)), ...variableNamesIn(JSON.stringify(light.shadows))]

    expect(names.length).toBe(Object.keys(themeVariables(lightTheme)).length)

    for (const name of names) {
      expect(lightNames.has(name)).toBe(true)
      expect(darkNames.has(name)).toBe(true)
    }
  })

  it('is the same for the light and the dark theme, so switching modes does not change it', () => {
    expect(themeReferences(darkTheme)).toEqual(light)
  })

  it('points the fonts to variables that exist', () => {
    const fontNames = new Set(Object.keys(fontVariables(lightTheme.fonts)))
    const names = variableNamesIn(JSON.stringify(light.fonts))

    expect(names).toHaveLength(fontNames.size)

    for (const name of names) expect(fontNames.has(name)).toBe(true)
  })

  it('keeps everything that is not a variable', () => {
    expect(light.breakpoints).toEqual(lightTheme.breakpoints)
    expect(light.spacing).toEqual(lightTheme.spacing)
  })
})

describe('fontVariablesRule', () => {
  it('writes one declaration per font variable, for the given selector', () => {
    const rule = fontVariablesRule(':root', lightTheme.fonts)

    expect(rule.startsWith(':root {\n')).toBe(true)
    expect(rule).toContain(`  --enchase-font-primary: ${lightTheme.fonts.primary};`)
    expect(rule).toContain('  --enchase-font-weight-bold: 700;')
    expect(rule.split('\n').filter((line) => line.startsWith('  --'))).toHaveLength(Object.keys(fontVariables(lightTheme.fonts)).length)
  })
})

describe('cssVariablesRule', () => {
  it('writes a rule with one declaration per token, for the given selector', () => {
    const rule = cssVariablesRule(':root', lightTheme)

    expect(rule.startsWith(':root {\n')).toBe(true)
    expect(rule.endsWith('\n}')).toBe(true)
    expect(rule).toContain(`  --enchase-color-primary: ${lightTheme.colors.primary};`)
    expect(rule).toContain(`  --enchase-color-text-primary: ${lightTheme.colors.text.primary};`)
    expect(rule).toContain(`  --enchase-shadow-sm: ${lightTheme.shadows.sm};`)
    expect(rule.split('\n').filter((line) => line.startsWith('  --'))).toHaveLength(Object.keys(themeVariables(lightTheme)).length)
  })

  it('writes the dark values under the selector it is given', () => {
    const rule = cssVariablesRule("[data-theme='dark']", darkTheme)

    expect(rule.startsWith("[data-theme='dark'] {\n")).toBe(true)
    expect(rule).toContain(`  --enchase-color-background: ${darkTheme.colors.background};`)
    expect(rule).toContain(`  --enchase-shadow-md: ${darkTheme.shadows.md};`)
  })
})
