import { describe, expect, it } from 'vitest'

import { canMeasureContrast, contrastRatio } from '@styles/theme/contrast.ts'
import { contrastChecks } from '@styles/theme/validateTheme.ts'
import { darkTheme, lightTheme } from '@styles/tokens/index.ts'

const themes = { light: lightTheme, dark: darkTheme }
const text = 4.5

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

  it('reads short hex and space separated rgb the same as the long forms', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 1)
    expect(contrastRatio('rgb(0 0 0)', 'rgb(255 255 255)')).toBeCloseTo(21, 1)
    expect(contrastRatio('rgb(0 0 0 / 60%)', '#ffffff')).toBeCloseTo(contrastRatio('rgba(0, 0, 0, 0.6)', '#ffffff'), 5)
    expect(contrastRatio('#0008', '#fff')).toBeCloseTo(contrastRatio('#00000088', '#ffffff'), 5)
  })

  it('does not guess formats it cannot read', () => {
    expect(contrastRatio('hsl(0 0% 0%)', '#ffffff')).toBeNaN()
    expect(contrastRatio('#000000', 'oklch(1 0 0)')).toBeNaN()
    expect(contrastRatio('transparent', '#ffffff')).toBeNaN()
  })
})

describe('canMeasureContrast', () => {
  it.each(['#fff', '#FFFF', '#4F46E5', '#4F46E5CC', 'rgb(1, 2, 3)', 'rgba(1, 2, 3, 0.5)', 'rgb(1 2 3 / 50%)'])('measures %s', (value) => {
    expect(canMeasureContrast(value)).toBe(true)
  })

  it.each(['hsl(244 76% 59%)', 'oklch(0.5 0.1 250)', 'transparent', 'rgb(10% 20% 30%)', 'rgb(300, 0, 0)', 'rgba(1, 2, 3, 2)', '', 'red'])('does not measure %s', (value) => {
    expect(canMeasureContrast(value)).toBe(false)
  })
})

describe.each(Object.entries(themes))('%s theme palette', (_, theme) => {
  const { colors } = theme

  it.each(contrastChecks(colors))('$label is at least $minimum:1', ({ foreground, background, minimum }) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(minimum)
  })

  it.each(codeTokenColors)('code token %s on the code background is at least 4.5:1', (color) => {
    expect(contrastRatio(color, colors.codeBackground)).toBeGreaterThanOrEqual(text)
  })
})
