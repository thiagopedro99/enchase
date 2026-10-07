import { describe, expect, it } from 'vitest'

import { darkTheme, lightTheme } from '@styles/themes/index.ts'
import { contrastRatio } from '@styles/contrast.ts'

const themes = { light: lightTheme, dark: darkTheme }
const text = 4.5
const component = 3

const codeTokenColors = ['#d4d4d4', '#6a9955', '#ce9178', '#c586c0', '#4ec9b0', '#dcdcaa', '#b5cea8', '#569cd6', '#9cdcfe']

describe('contrastRatio', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1)
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2)
  })

  it('blends translucent foregrounds over the background', () => {
    expect(contrastRatio('rgba(0, 0, 0, 0.6)', '#ffffff')).toBeCloseTo(contrastRatio('#666666', '#ffffff'), 1)
  })
})

describe.each(Object.entries(themes))('%s theme palette', (_, theme) => {
  const { colors } = theme
  const surfaces = [
    ['surface', colors.surface],
    ['background', colors.background],
    ['surfaceContainerLow', colors.surfaceContainerLow],
    ['surfaceContainer', colors.surfaceContainer],
    ['surfaceContainerHigh', colors.surfaceContainerHigh]
  ] as const

  const onSurface = surfaces.flatMap(([surfaceName, surface]) => [
    [`primary text on ${surfaceName}`, colors.text.primary, surface],
    [`secondary text on ${surfaceName}`, colors.text.secondary, surface],
    [`link on ${surfaceName}`, colors.primary, surface],
    [`link hover on ${surfaceName}`, colors.primaryHover, surface],
    [`error text on ${surfaceName}`, colors.error, surface],
    [`success text on ${surfaceName}`, colors.success, surface],
    [`warning text on ${surfaceName}`, colors.warning, surface],
    [`info text on ${surfaceName}`, colors.info, surface]
  ])

  it.each([
    ...onSurface,
    ['placeholder on surface', colors.text.placeholder, colors.surface],
    ['placeholder on surfaceContainerLow', colors.text.placeholder, colors.surfaceContainerLow],
    ['placeholder on surfaceContainer', colors.text.placeholder, colors.surfaceContainer],
    ['placeholder on surfaceContainerHigh', colors.text.placeholder, colors.surfaceContainerHigh],
    ['onPrimary on primary', colors.onPrimary, colors.primary],
    ['inverse text on primary', colors.text.inverse, colors.primary],
    ['onPrimaryContainer on primaryContainer', colors.onPrimaryContainer, colors.primaryContainer],
    ['link on primaryContainer', colors.primary, colors.primaryContainer],
    ['link hover on primaryContainer', colors.primaryHover, colors.primaryContainer],
    ['onSecondary on secondary', colors.onSecondary, colors.secondary],
    ['onSecondaryContainer on secondaryContainer', colors.onSecondaryContainer, colors.secondaryContainer],
    ['onError on error', colors.onError, colors.error],
    ['onErrorContainer on errorContainer', colors.onErrorContainer, colors.errorContainer],
    ['onSuccess on success', colors.onSuccess, colors.success],
    ['onSuccessContainer on successContainer', colors.onSuccessContainer, colors.successContainer],
    ['onWarning on warning', colors.onWarning, colors.warning],
    ['onWarningContainer on warningContainer', colors.onWarningContainer, colors.warningContainer],
    ['onInfo on info', colors.onInfo, colors.info],
    ['onInfoContainer on infoContainer', colors.onInfoContainer, colors.infoContainer],
    ['inverseOnSurface on inverseSurface', colors.inverseOnSurface, colors.inverseSurface],
    ['inversePrimary action on inverseSurface', colors.inversePrimary, colors.inverseSurface]
  ])('%s is at least 4.5:1 (WCAG 1.4.3)', (_label, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(text)
  })

  it.each(
    surfaces.flatMap(([surfaceName, surface]) => [
      [`form control border on ${surfaceName}`, colors.borderStrong, surface],
      [`primary (focus ring, outline) on ${surfaceName}`, colors.primary, surface],
      [`error (invalid border) on ${surfaceName}`, colors.error, surface]
    ])
  )('%s is at least 3:1 (WCAG 1.4.11)', (_label, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(component)
  })

  it.each(codeTokenColors)('code token %s on the code background is at least 4.5:1', (color) => {
    expect(contrastRatio(color, colors.codeBackground)).toBeGreaterThanOrEqual(text)
  })
})
