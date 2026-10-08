import { canMeasureContrast, contrastRatio } from './contrast.ts'
import { colorRoles, themeModes } from '../tokens/types.ts'

import type { ColorTokens, ThemeSet } from '../tokens/types.ts'

export type ContrastCheck = { label: string; foreground: string; background: string; minimum: number }

export type ContrastIssue = ContrastCheck & { mode: 'light' | 'dark'; ratio: number | null }

export const textContrast = 4.5

export const componentContrast = 3

const surfaceNames = ['surface', 'background', 'surfaceContainerLow', 'surfaceContainer', 'surfaceContainerHigh'] as const

const capitalize = <Text extends string>(text: Text) => (text.charAt(0).toUpperCase() + text.slice(1)) as Capitalize<Text>

export const contrastChecks = (colors: ColorTokens): ContrastCheck[] => {
  const surfaces = surfaceNames.map((name) => [name, colors[name]] as const)

  const pair = (label: string, foreground: string, background: string, minimum: number): ContrastCheck => ({ label, foreground, background, minimum })

  const textOnSurface = [
    ['primary text', colors.text.primary],
    ['secondary text', colors.text.secondary],
    ['link', colors.primary],
    ['link hover', colors.primaryHover],
    ['error text', colors.error],
    ['success text', colors.success],
    ['warning text', colors.warning],
    ['info text', colors.info]
  ] as const

  const componentOnSurface = [
    ['form control border', colors.borderStrong],
    ['primary (focus ring, outline)', colors.primary],
    ['error (invalid border)', colors.error]
  ] as const

  const onRole = colorRoles.flatMap((role) => {
    const on = `on${capitalize(role)}` as const

    return [pair(`${on} on ${role}`, colors[on], colors[role], textContrast), pair(`${on}Container on ${role}Container`, colors[`${on}Container`], colors[`${role}Container`], textContrast)]
  })

  return [
    ...surfaces.flatMap(([name, surface]) => textOnSurface.map(([label, color]) => pair(`${label} on ${name}`, color, surface, textContrast))),
    ...surfaces.filter(([name]) => name !== 'background').map(([name, surface]) => pair(`placeholder on ${name}`, colors.text.placeholder, surface, textContrast)),
    ...onRole,
    pair('inverse text on primary', colors.text.inverse, colors.primary, textContrast),
    pair('link on primaryContainer', colors.primary, colors.primaryContainer, textContrast),
    pair('link hover on primaryContainer', colors.primaryHover, colors.primaryContainer, textContrast),
    pair('inverseOnSurface on inverseSurface', colors.inverseOnSurface, colors.inverseSurface, textContrast),
    pair('inversePrimary action on inverseSurface', colors.inversePrimary, colors.inverseSurface, textContrast),
    ...surfaces.flatMap(([name, surface]) => componentOnSurface.map(([label, color]) => pair(`${label} on ${name}`, color, surface, componentContrast)))
  ]
}

export const formatContrastIssues = (issues: ContrastIssue[]): string | null => {
  const failures = issues.filter((issue) => issue.ratio !== null)
  const unmeasured = issues.length - failures.length

  if (issues.length === 0) return null

  const lines = failures.map((issue) => `  ${issue.mode} · ${issue.label}: ${issue.ratio?.toFixed(2)}:1 (needs ${issue.minimum}:1)`)

  if (unmeasured > 0) lines.push(`  ${unmeasured} pair(s) not checked: use hex or rgb colors to check their contrast`)

  const heading = failures.length > 0 ? `[enchase] ${failures.length} color pair(s) of the theme are below the minimum contrast` : '[enchase] some color pairs of the theme could not be checked'

  return [heading, ...lines].join('\n')
}

export const validateTheme = (themes: ThemeSet): ContrastIssue[] =>
  themeModes.flatMap((mode) =>
    contrastChecks(themes[mode].colors).flatMap((check): ContrastIssue[] => {
      if (!canMeasureContrast(check.foreground) || !canMeasureContrast(check.background)) return [{ ...check, mode, ratio: null }]

      const ratio = contrastRatio(check.foreground, check.background)

      return ratio < check.minimum ? [{ ...check, mode, ratio }] : []
    })
  )
