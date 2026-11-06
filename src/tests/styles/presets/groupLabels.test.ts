import { describe, expect, it } from 'vitest'

import { builtInStyleEntries } from '@tests/shared/fixtures/styles.ts'
import { defineStyle } from '@styles/theme/style.ts'

import type { ThemeStyle } from '@styles/theme/style.ts'

const references = ['slider-label', 'radio-group-legend', 'checkbox-group-legend']

const own = 'segmented-control-label'

const properties = ['font-size', 'font-weight', 'color']

const valuesOf = (style: ThemeStyle, family: string, property: string) =>
  [
    ['hooks', style.hooks],
    ['colorHooks', style.colorHooks],
    ['light', style.light?.hooks],
    ['dark', style.dark?.hooks],
    ['compact', style.density?.compact?.hooks]
  ].flatMap(([scope, record]) => {
    const value = (record as Record<string, string> | undefined)?.[`--enchase-${family}-${property}`]

    return value === undefined ? [] : [`${scope as string}: ${value}`]
  })

const problemsOf = (style: ThemeStyle) =>
  properties.flatMap((property) => {
    const wanted = references.map((family) => [family, valuesOf(style, family, property)] as const).filter(([, values]) => values.length > 0)
    const actual = valuesOf(style, own, property)

    if (wanted.length === 0) return actual.length === 0 ? [] : [`${own}-${property} is set (${actual.join(', ')}) and no reference label sets ${property}`]

    return wanted.flatMap(([family, values]) => (JSON.stringify(values) === JSON.stringify(actual) ? [] : [`${own}-${property} is ${actual.join(', ') || 'missing'} and ${family}-${property} is ${values.join(', ')}`]))
  })

describe('the labels of the groups of controls inside a style', () => {
  it.each(builtInStyleEntries)('keeps the label of the segmented control in step with the label of the slider and the legends of the groups in the %s style', (_, style) => {
    expect(problemsOf(style)).toEqual([])
  })

  it('names a style that gives a size and a color to the label of the slider and nothing to the label of the segmented control', () => {
    const style = defineStyle({ hooks: { '--enchase-slider-label-font-size': 'var(--enchase-font-size-sm)' }, colorHooks: { '--enchase-slider-label-color': 'var(--enchase-color-text-primary)' } })

    expect(problemsOf(style)).toEqual([
      'segmented-control-label-font-size is missing and slider-label-font-size is hooks: var(--enchase-font-size-sm)',
      'segmented-control-label-color is missing and slider-label-color is colorHooks: var(--enchase-color-text-primary)'
    ])
  })

  it('names a style whose segmented control label differs from the legend of a group, or sits in another record', () => {
    const style = defineStyle({
      hooks: { '--enchase-radio-group-legend-font-weight': 'var(--enchase-font-weight-medium)', '--enchase-segmented-control-label-font-weight': 'var(--enchase-font-weight-bold)' },
      colorHooks: { '--enchase-checkbox-group-legend-color': 'var(--enchase-color-text-primary)' },
      light: { hooks: { '--enchase-segmented-control-label-color': 'var(--enchase-color-text-primary)' } }
    })

    expect(problemsOf(style)).toEqual([
      'segmented-control-label-font-weight is hooks: var(--enchase-font-weight-bold) and radio-group-legend-font-weight is hooks: var(--enchase-font-weight-medium)',
      'segmented-control-label-color is light: var(--enchase-color-text-primary) and checkbox-group-legend-color is colorHooks: var(--enchase-color-text-primary)'
    ])
  })

  it('names a style that sets a label of the segmented control that nothing else in it sets', () => {
    const style = defineStyle({ hooks: { '--enchase-segmented-control-label-font-size': 'var(--enchase-font-size-sm)' } })

    expect(problemsOf(style)).toEqual(['segmented-control-label-font-size is set (hooks: var(--enchase-font-size-sm)) and no reference label sets font-size'])
  })
})
