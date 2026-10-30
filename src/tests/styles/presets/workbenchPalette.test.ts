import { describe, expect, it } from 'vitest'

import { componentContrast, contrastChecks, textContrast, validateTheme } from '@styles/theme/validateTheme.ts'
import { assertStyle, defineStyle } from '@styles/theme/style.ts'
import { darkTheme, lightTheme } from '@styles/tokens/index.ts'
import { createTheme } from '@styles/theme/createTheme.ts'
import { contrastRatio } from '@styles/theme/contrast.ts'
import { workbench } from '@styles/presets/workbench.ts'
import { parseColor } from '@styles/theme/rgb.ts'

import type { ColorTokens } from '@styles/tokens/types.ts'

const modes = ['light', 'dark'] as const

const accentRoles = ['primary', 'onPrimary', 'primaryHover']

const palette = [
  ['primary', '#0958D9', '#65A9F3'],
  ['onPrimary', '#FFFFFF', '#141414'],
  ['primaryHover', '#003EB3', '#8DC5F8'],
  ['primaryContainer', '#E6F4FF', '#15325B'],
  ['onPrimaryContainer', '#0958D9', '#8DC5F8'],
  ['secondary', '#595959', '#ADADAD'],
  ['onSecondary', '#FFFFFF', '#141414'],
  ['secondaryContainer', '#F5F5F5', '#272727'],
  ['onSecondaryContainer', '#1F1F1F', '#DCDCDC'],
  ['background', '#F5F5F5', '#000000'],
  ['surface', '#FFFFFF', '#141414'],
  ['surfaceContainerLow', '#FAFAFA', '#1F1F1F'],
  ['surfaceContainer', '#F5F5F5', '#272727'],
  ['surfaceContainerHigh', '#F0F0F0', '#303030'],
  ['text.primary', 'rgba(0, 0, 0, 0.88)', 'rgba(255, 255, 255, 0.85)'],
  ['text.secondary', 'rgba(0, 0, 0, 0.65)', 'rgba(255, 255, 255, 0.65)'],
  ['text.disabled', 'rgba(0, 0, 0, 0.38)', 'rgba(255, 255, 255, 0.38)'],
  ['text.placeholder', 'rgba(0, 0, 0, 0.55)', 'rgba(255, 255, 255, 0.55)'],
  ['text.inverse', '#FFFFFF', '#141414'],
  ['border', '#F0F0F0', '#303030'],
  ['borderStrong', 'rgba(0, 0, 0, 0.45)', 'rgba(255, 255, 255, 0.45)'],
  ['borderLight', '#F5F5F5', '#1F1F1F'],
  ['error', '#CF1322', '#F39C97'],
  ['onError', '#FFFFFF', '#141414'],
  ['errorContainer', '#FFF2F0', '#2C1618'],
  ['onErrorContainer', '#CF1322', '#F8C6C2'],
  ['success', '#237804', '#6ABE39'],
  ['onSuccess', '#FFFFFF', '#141414'],
  ['successContainer', '#F6FFED', '#162312'],
  ['onSuccessContainer', '#237804', '#B2E58B'],
  ['warning', '#874D00', '#D89614'],
  ['onWarning', '#FFFFFF', '#141414'],
  ['warningContainer', '#FFFBE6', '#2B2111'],
  ['onWarningContainer', '#874D00', '#F3CC62'],
  ['info', '#0958D9', '#65A9F3'],
  ['onInfo', '#FFFFFF', '#141414'],
  ['infoContainer', '#E6F4FF', '#111A2C'],
  ['onInfoContainer', '#0958D9', '#8DC5F8'],
  ['inverseSurface', '#262626', '#424242'],
  ['inverseOnSurface', '#FFFFFF', '#FFFFFF'],
  ['inversePrimary', '#69B1FF', '#8DC5F8'],
  ['overlay', 'rgba(0, 0, 0, 0.45)', 'rgba(0, 0, 0, 0.45)'],
  ['codeBackground', '#141414', '#0D0D0D']
] as const

const brands = [
  ['blue', '#0B6BCB'],
  ['yellow', '#FFD54F'],
  ['red', '#E53935'],
  ['orange', '#FB8C00'],
  ['green', '#00C853'],
  ['cyan', '#26C6DA'],
  ['purple', '#4A148C'],
  ['pink', '#F06292']
] as const

const popupShadow = '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'

const flatten = (colors: ColorTokens): Record<string, string> =>
  Object.fromEntries(
    Object.entries(colors).flatMap(([role, value]): [string, string][] => {
      if (typeof value === 'string') return [[role, value]]

      return Object.entries(value).map(([name, inner]): [string, string] => [`${role}.${name}`, inner])
    })
  )

const changedRoles = (before: ColorTokens, after: ColorTokens) => {
  const [previous, next] = [flatten(before), flatten(after)]

  return Object.keys(previous).filter((role) => previous[role] !== next[role])
}

const theme = createTheme({ style: workbench })

describe('the workbench style', () => {
  it('is a style that passed defineStyle, deeply frozen and valid when it is checked again', () => {
    expect(Object.isFrozen(workbench)).toBe(true)
    expect(assertStyle(workbench)).toBe(workbench)
    expect(() => defineStyle(JSON.parse(JSON.stringify(workbench)))).not.toThrow()
  })

  it('makes a theme with createTheme that keeps every role of the default theme in both modes', () => {
    expect(() => createTheme({ style: workbench })).not.toThrow()
    expect(Object.keys(flatten(theme.light.colors)).sort()).toEqual(Object.keys(flatten(lightTheme.colors)).sort())
    expect(Object.keys(flatten(theme.dark.colors)).sort()).toEqual(Object.keys(flatten(darkTheme.colors)).sort())
  })

  it('lists each of the 43 roles of the palette once', () => {
    expect(palette).toHaveLength(43)
    expect(palette.map(([role]) => role).sort()).toEqual(Object.keys(flatten(lightTheme.colors)).sort())
  })

  it.each(palette)('sets %s to %s in the light mode and to %s in the dark mode', (role, light, dark) => {
    expect(flatten(theme.light.colors)[role]).toBe(light)
    expect(flatten(theme.dark.colors)[role]).toBe(dark)
  })

  it('sets the disabled text to an alpha of 0.38 in both modes', () => {
    expect(parseColor(theme.light.colors.text.disabled)?.a).toBe(0.38)
    expect(parseColor(theme.dark.colors.text.disabled)?.a).toBe(0.38)
  })

  it('takes the shadows of the style in the light mode and keeps those of the default theme in the dark mode', () => {
    expect(theme.light.shadows).toEqual({
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05), 0 1px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px 0 rgba(0, 0, 0, 0.03)',
      md: popupShadow,
      lg: popupShadow,
      xl: popupShadow
    })
    expect(workbench.dark?.shadows).toBeUndefined()
    expect(theme.dark.shadows).toEqual(darkTheme.shadows)
  })

  describe.each(modes)('in the %s mode', (mode) => {
    it('has no pair of colors below the minimum contrast', () => {
      expect(validateTheme(theme).filter((issue) => issue.mode === mode)).toEqual([])
    })

    it.each(brands)('has no pair of colors below the minimum contrast with the %s brand %s', (_name, brand) => {
      expect(validateTheme(createTheme({ style: workbench, brand })).filter((issue) => issue.mode === mode)).toEqual([])
    })
  })

  describe('the narrow margins of the light mode', () => {
    const checks = contrastChecks(theme.light.colors)
    const greyPlaceholders = checks.filter(({ label }) => label.startsWith('placeholder on surfaceContainer'))
    const strongBorders = checks.filter(({ label }) => label.startsWith('form control border on '))

    it('looks at the placeholder on the three grey surfaces and at the strong border on the five surfaces', () => {
      expect(greyPlaceholders).toHaveLength(3)
      expect(strongBorders).toHaveLength(5)
    })

    it.each(greyPlaceholders)('keeps the pair $label at the floor of 4.5:1 for text', ({ foreground, background }) => {
      expect(textContrast).toBe(4.5)
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(textContrast)
    })

    it.each(strongBorders)('keeps the pair $label at the floor of 3:1 for components', ({ foreground, background }) => {
      expect(componentContrast).toBe(3)
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(componentContrast)
    })
  })

  describe('the brand', () => {
    it('lists the accent roles and leaves out the inverse primary', () => {
      expect(workbench.brand).toEqual(accentRoles)
      expect(workbench.brand).not.toContain('inversePrimary')
    })

    it.each(brands)('changes only the accent roles in both modes with the %s brand %s', (_name, brand) => {
      const branded = createTheme({ style: workbench, brand })

      for (const mode of modes) {
        const changed = changedRoles(theme[mode].colors, branded[mode].colors)

        expect(changed.filter((role) => !accentRoles.includes(role))).toEqual([])
      }
    })

    it('takes the accent from the brand color and keeps the neutrals and the inverse primary of the style', () => {
      const branded = createTheme({ style: workbench, brand: '#0B6BCB' })

      for (const mode of modes) expect(branded[mode].colors.primary).not.toBe(theme[mode].colors.primary)

      expect(branded.light.colors.inversePrimary).toBe('#69B1FF')
      expect(branded.dark.colors.inversePrimary).toBe('#8DC5F8')
      expect(branded.light.colors.surfaceContainerHigh).toBe('#F0F0F0')
      expect(branded.dark.colors.inverseSurface).toBe('#424242')
    })
  })
})
