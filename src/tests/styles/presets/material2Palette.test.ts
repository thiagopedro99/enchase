import { describe, expect, it } from 'vitest'

import { componentContrast, contrastChecks, textContrast, validateTheme } from '@styles/theme/validateTheme.ts'
import { assertStyle, defineStyle } from '@styles/theme/style.ts'
import { darkTheme, lightTheme } from '@styles/tokens/index.ts'
import { createTheme } from '@styles/theme/createTheme.ts'
import { contrastRatio } from '@styles/theme/contrast.ts'
import { material2 } from '@styles/presets/material2.ts'
import { parseColor } from '@styles/theme/rgb.ts'

import type { ColorTokens } from '@styles/tokens/types.ts'

const modes = ['light', 'dark'] as const

const accentRoles = ['primary', 'onPrimary', 'primaryHover']

const palette = [
  ['primary', '#066CC8', '#90CAF9'],
  ['onPrimary', '#FFFFFF', 'rgba(0, 0, 0, 0.87)'],
  ['primaryHover', '#1565C0', '#BBDEFB'],
  ['primaryContainer', '#EDF4FB', '#262F37'],
  ['onPrimaryContainer', '#066CC8', '#90CAF9'],
  ['secondary', '#9C27B0', '#CE93D8'],
  ['onSecondary', '#FFFFFF', 'rgba(0, 0, 0, 0.87)'],
  ['secondaryContainer', '#E0E0E0', '#302732'],
  ['onSecondaryContainer', 'rgba(0, 0, 0, 0.87)', '#CE93D8'],
  ['background', '#FFFFFF', '#121212'],
  ['surface', '#FFFFFF', '#121212'],
  ['surfaceContainerLow', '#FAFAFA', '#1D1D1D'],
  ['surfaceContainer', '#F5F5F5', '#1E1E1E'],
  ['surfaceContainerHigh', '#EEEEEE', '#232323'],
  ['text.primary', 'rgba(0, 0, 0, 0.87)', '#FFFFFF'],
  ['text.secondary', 'rgba(0, 0, 0, 0.6)', 'rgba(255, 255, 255, 0.7)'],
  ['text.disabled', 'rgba(0, 0, 0, 0.38)', 'rgba(255, 255, 255, 0.5)'],
  ['text.placeholder', 'rgba(0, 0, 0, 0.6)', 'rgba(255, 255, 255, 0.7)'],
  ['text.inverse', '#FFFFFF', 'rgba(0, 0, 0, 0.87)'],
  ['border', 'rgba(0, 0, 0, 0.12)', 'rgba(255, 255, 255, 0.12)'],
  ['borderStrong', 'rgba(0, 0, 0, 0.45)', 'rgba(255, 255, 255, 0.4)'],
  ['borderLight', 'rgba(0, 0, 0, 0.08)', 'rgba(255, 255, 255, 0.08)'],
  ['error', '#CF2A2C', '#F9483A'],
  ['onError', '#FFFFFF', 'rgba(0, 0, 0, 0.87)'],
  ['errorContainer', '#FDEDED', '#160B0B'],
  ['onErrorContainer', '#5F2120', '#F4C7C7'],
  ['success', '#2C7B31', '#66BB6A'],
  ['onSuccess', '#FFFFFF', 'rgba(0, 0, 0, 0.87)'],
  ['successContainer', '#EDF7ED', '#0C130D'],
  ['onSuccessContainer', '#1E4620', '#CCE8CD'],
  ['warning', '#B24F00', '#FFA726'],
  ['onWarning', '#FFFFFF', 'rgba(0, 0, 0, 0.87)'],
  ['warningContainer', '#FFF4E5', '#191207'],
  ['onWarningContainer', '#663C00', '#FFE2B7'],
  ['info', '#0071B0', '#29B6F6'],
  ['onInfo', '#FFFFFF', 'rgba(0, 0, 0, 0.87)'],
  ['infoContainer', '#E5F6FD', '#071318'],
  ['onInfoContainer', '#014361', '#B8E7FB'],
  ['inverseSurface', 'rgba(97, 97, 97, 0.92)', 'rgba(97, 97, 97, 0.92)'],
  ['inverseOnSurface', '#FFFFFF', '#FFFFFF'],
  ['inversePrimary', '#BCE1FF', '#BCE1FF'],
  ['overlay', 'rgba(0, 0, 0, 0.5)', 'rgba(0, 0, 0, 0.5)'],
  ['codeBackground', '#2B2B2B', '#2B2B2B']
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

const elevation1 = '0px 2px 1px -1px rgba(0, 0, 0, 0.2), 0px 1px 1px 0px rgba(0, 0, 0, 0.14), 0px 1px 3px 0px rgba(0, 0, 0, 0.12)'

const elevation4 = '0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12)'

const elevation8 = '0px 5px 5px -3px rgba(0, 0, 0, 0.2), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12)'

const elevation24 = '0px 11px 15px -7px rgba(0, 0, 0, 0.2), 0px 24px 38px 3px rgba(0, 0, 0, 0.14), 0px 9px 46px 8px rgba(0, 0, 0, 0.12)'

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

const theme = createTheme({ style: material2 })

describe('the material2 style', () => {
  it('is a style that passed defineStyle, deeply frozen and valid when it is checked again', () => {
    expect(Object.isFrozen(material2)).toBe(true)
    expect(assertStyle(material2)).toBe(material2)
    expect(() => defineStyle(JSON.parse(JSON.stringify(material2)))).not.toThrow()
  })

  it('makes a theme with createTheme that keeps every role of the default theme in both modes', () => {
    expect(() => createTheme({ style: material2 })).not.toThrow()
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

  it('sets the disabled text to an alpha of 0.38 in the light mode and 0.5 in the dark mode, as MUI does', () => {
    expect(parseColor(theme.light.colors.text.disabled)?.a).toBe(0.38)
    expect(parseColor(theme.dark.colors.text.disabled)?.a).toBe(0.5)
  })

  it('takes the MUI elevation shadows in both modes, since MUI does not vary them by mode', () => {
    expect(theme.light.shadows).toEqual({ none: 'none', sm: elevation1, md: elevation4, lg: elevation8, xl: elevation24 })
    expect(theme.dark.shadows).toEqual({ none: 'none', sm: elevation1, md: elevation4, lg: elevation8, xl: elevation24 })
    expect(theme.light.shadows).toEqual(theme.dark.shadows)
  })

  describe.each(modes)('in the %s mode', (mode) => {
    it('has no pair of colors below the minimum contrast', () => {
      expect(validateTheme(theme).filter((issue) => issue.mode === mode)).toEqual([])
    })

    it.each(brands)('has no pair of colors below the minimum contrast with the %s brand %s', (_name, brand) => {
      expect(validateTheme(createTheme({ style: material2, brand })).filter((issue) => issue.mode === mode)).toEqual([])
    })
  })

  describe('the narrow margins of the light mode, kept from MUI by hue with the least change that clears the floor', () => {
    const checks = contrastChecks(theme.light.colors)
    const strongBorders = checks.filter(({ label }) => label.startsWith('form control border on '))
    const warningText = checks.filter(({ label }) => label.startsWith('warning text on '))
    const infoText = checks.filter(({ label }) => label.startsWith('info text on '))

    it('looks at the strong border on the five surfaces and at the warning and the info text on each of them', () => {
      expect(strongBorders).toHaveLength(5)
      expect(warningText).toHaveLength(5)
      expect(infoText).toHaveLength(5)
    })

    it.each(strongBorders)('keeps the pair $label at the floor of 3:1 for components', ({ foreground, background }) => {
      expect(componentContrast).toBe(3)
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(componentContrast)
    })

    it.each([...warningText, ...infoText])('keeps the pair $label at the floor of 4.5:1 for text', ({ foreground, background }) => {
      expect(textContrast).toBe(4.5)
      expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(textContrast)
    })

    it('keeps the hue of warning and info: only the lightness moved away from MUI, not the hue', () => {
      expect(theme.light.colors.warning).not.toBe('#ED6C02')
      expect(theme.light.colors.info).not.toBe('#0288D1')
      expect(theme.dark.colors.warning).toBe('#FFA726')
      expect(theme.dark.colors.info).toBe('#29B6F6')
    })
  })

  describe('the brand', () => {
    it('lists the accent roles and leaves out the inverse primary', () => {
      expect(material2.brand).toEqual(accentRoles)
      expect(material2.brand).not.toContain('inversePrimary')
    })

    it.each(brands)('changes only the accent roles in both modes with the %s brand %s', (_name, brand) => {
      const branded = createTheme({ style: material2, brand })

      for (const mode of modes) {
        const changed = changedRoles(theme[mode].colors, branded[mode].colors)

        expect(changed.filter((role) => !accentRoles.includes(role))).toEqual([])
      }
    })

    it('takes the accent from the brand color and keeps the neutrals and the inverse primary of the style', () => {
      const branded = createTheme({ style: material2, brand: '#0B6BCB' })

      for (const mode of modes) expect(branded[mode].colors.primary).not.toBe(theme[mode].colors.primary)

      expect(branded.light.colors.inversePrimary).toBe('#BCE1FF')
      expect(branded.dark.colors.inversePrimary).toBe('#BCE1FF')
      expect(branded.light.colors.surfaceContainerHigh).toBe('#EEEEEE')
      expect(branded.dark.colors.inverseSurface).toBe('rgba(97, 97, 97, 0.92)')
    })
  })
})
