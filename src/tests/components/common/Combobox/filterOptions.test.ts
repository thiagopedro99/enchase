import { describe, expect, it } from 'vitest'

import { defaultFilter, visibleOptions } from '@components/common/Combobox/filterOptions.ts'

const options = [
  { value: 'sp', label: 'São Paulo' },
  { value: 'rj', label: 'Rio de Janeiro' },
  { value: 'cu', label: 'Curitiba', disabled: true },
  { value: 'ca', label: 'Cáceres' }
]

describe('defaultFilter', () => {
  it('matches the label wherever the text is in it', () => {
    expect(defaultFilter(options[1], 'de jan')).toBe(true)
    expect(defaultFilter(options[1], 'rio')).toBe(true)
    expect(defaultFilter(options[1], 'xyz')).toBe(false)
  })

  it('ignores the case of both texts', () => {
    expect(defaultFilter(options[0], 'SÃO')).toBe(true)
    expect(defaultFilter({ value: 'x', label: 'ABC' }, 'b')).toBe(true)
  })

  it('ignores accents on both sides', () => {
    expect(defaultFilter(options[0], 'sao')).toBe(true)
    expect(defaultFilter(options[3], 'cac')).toBe(true)
    expect(defaultFilter({ value: 'x', label: 'Sao Paulo' }, 'são')).toBe(true)
  })

  it('does not look at the value', () => {
    expect(defaultFilter(options[0], 'sp')).toBe(false)
  })
})

describe('visibleOptions', () => {
  it('keeps every option, in order, for an empty or blank text', () => {
    expect(visibleOptions(options, '', undefined)).toBe(options)
    expect(visibleOptions(options, '   ', undefined)).toBe(options)
  })

  it('keeps the options that match, in order, disabled ones included', () => {
    expect(visibleOptions(options, 'c', undefined).map((option) => option.value)).toEqual(['cu', 'ca'])
    expect(visibleOptions(options, 'a', undefined).map((option) => option.value)).toEqual(['sp', 'rj', 'cu', 'ca'])
    expect(visibleOptions(options, 'cu', undefined).map((option) => option.value)).toEqual(['cu'])
  })

  it('trims the text before it filters', () => {
    expect(visibleOptions(options, '  rio  ', undefined).map((option) => option.value)).toEqual(['rj'])
  })

  it('keeps everything when the filter is off, whatever the text', () => {
    expect(visibleOptions(options, 'zzz', false)).toBe(options)
  })

  it('filters with the function it is given, which gets the option and the trimmed text', () => {
    const seen: string[] = []
    const result = visibleOptions(options, ' rj ', (option, query) => {
      seen.push(query)

      return option.value === query
    })

    expect(result.map((option) => option.value)).toEqual(['rj'])
    expect(new Set(seen)).toEqual(new Set(['rj']))
  })

  it('gives no options when nothing matches', () => {
    expect(visibleOptions(options, 'zzz', undefined)).toEqual([])
  })
})
