import { canMeasureContrast, contrastRatio } from './contrast.ts'

import type { ThemeSet } from './createTheme.ts'
import type { Theme } from './themes/index.ts'

export type ContrastCheck = { label: string; foreground: string; background: string; minimum: number }

export type ContrastIssue = ContrastCheck & { mode: 'light' | 'dark'; ratio: number | null }

export const textContrast = 4.5

export const componentContrast = 3

export const contrastChecks = (colors: Theme['colors']): ContrastCheck[] => {
  const surfaces = [
    ['surface', colors.surface],
    ['background', colors.background],
    ['surfaceContainerLow', colors.surfaceContainerLow],
    ['surfaceContainer', colors.surfaceContainer],
    ['surfaceContainerHigh', colors.surfaceContainerHigh]
  ] as const

  const pair = (label: string, foreground: string, background: string, minimum: number): ContrastCheck => ({ label, foreground, background, minimum })

  return [
    ...surfaces.flatMap(([name, surface]) => [
      pair(`primary text on ${name}`, colors.text.primary, surface, textContrast),
      pair(`secondary text on ${name}`, colors.text.secondary, surface, textContrast),
      pair(`link on ${name}`, colors.primary, surface, textContrast),
      pair(`link hover on ${name}`, colors.primaryHover, surface, textContrast),
      pair(`error text on ${name}`, colors.error, surface, textContrast),
      pair(`success text on ${name}`, colors.success, surface, textContrast),
      pair(`warning text on ${name}`, colors.warning, surface, textContrast),
      pair(`info text on ${name}`, colors.info, surface, textContrast)
    ]),
    pair('placeholder on surface', colors.text.placeholder, colors.surface, textContrast),
    pair('placeholder on surfaceContainerLow', colors.text.placeholder, colors.surfaceContainerLow, textContrast),
    pair('placeholder on surfaceContainer', colors.text.placeholder, colors.surfaceContainer, textContrast),
    pair('placeholder on surfaceContainerHigh', colors.text.placeholder, colors.surfaceContainerHigh, textContrast),
    pair('onPrimary on primary', colors.onPrimary, colors.primary, textContrast),
    pair('inverse text on primary', colors.text.inverse, colors.primary, textContrast),
    pair('onPrimaryContainer on primaryContainer', colors.onPrimaryContainer, colors.primaryContainer, textContrast),
    pair('link on primaryContainer', colors.primary, colors.primaryContainer, textContrast),
    pair('link hover on primaryContainer', colors.primaryHover, colors.primaryContainer, textContrast),
    pair('onSecondary on secondary', colors.onSecondary, colors.secondary, textContrast),
    pair('onSecondaryContainer on secondaryContainer', colors.onSecondaryContainer, colors.secondaryContainer, textContrast),
    pair('onError on error', colors.onError, colors.error, textContrast),
    pair('onErrorContainer on errorContainer', colors.onErrorContainer, colors.errorContainer, textContrast),
    pair('onSuccess on success', colors.onSuccess, colors.success, textContrast),
    pair('onSuccessContainer on successContainer', colors.onSuccessContainer, colors.successContainer, textContrast),
    pair('onWarning on warning', colors.onWarning, colors.warning, textContrast),
    pair('onWarningContainer on warningContainer', colors.onWarningContainer, colors.warningContainer, textContrast),
    pair('onInfo on info', colors.onInfo, colors.info, textContrast),
    pair('onInfoContainer on infoContainer', colors.onInfoContainer, colors.infoContainer, textContrast),
    pair('inverseOnSurface on inverseSurface', colors.inverseOnSurface, colors.inverseSurface, textContrast),
    pair('inversePrimary action on inverseSurface', colors.inversePrimary, colors.inverseSurface, textContrast),
    ...surfaces.flatMap(([name, surface]) => [
      pair(`form control border on ${name}`, colors.borderStrong, surface, componentContrast),
      pair(`primary (focus ring, outline) on ${name}`, colors.primary, surface, componentContrast),
      pair(`error (invalid border) on ${name}`, colors.error, surface, componentContrast)
    ])
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
  (['light', 'dark'] as const).flatMap((mode) =>
    contrastChecks(themes[mode].colors).flatMap((check): ContrastIssue[] => {
      if (!canMeasureContrast(check.foreground) || !canMeasureContrast(check.background)) return [{ ...check, mode, ratio: null }]

      const ratio = contrastRatio(check.foreground, check.background)

      return ratio < check.minimum ? [{ ...check, mode, ratio }] : []
    })
  )
