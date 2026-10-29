import { resolveLocale } from './resolveLocale.ts'

export type NumberFormatOptions = Pick<Intl.NumberFormatOptions, 'style' | 'currency' | 'currencyDisplay' | 'minimumFractionDigits' | 'maximumFractionDigits' | 'useGrouping'>

export type NumberFormatter = {
  decimal: string
  group: string
  fractionDigits: number
  format: (value: number) => string
  parse: (text: string) => number
  normalize: (value: number) => number
  isPartial: (text: string, allowNegative?: boolean) => boolean
}

const symbolTypes = new Set(['currency', 'percentSign', 'literal'])
const directionMarks = /[‎‏؜]/g
const whitespace = /\s/g
const plainNumber = /^\d*\.?\d*$/

const construct = (locale: string, options: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale, options)

const removeAll = (text: string, token: string) => (token ? text.split(token).join('') : text)

const escapePattern = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const createNumberFormat = (requested: string, options: NumberFormatOptions = {}, precision = 0): NumberFormatter => {
  const locale = resolveLocale(requested, Intl.NumberFormat)
  const standard = construct(locale, options).resolvedOptions()
  const formatter = construct(locale, { ...options, maximumFractionDigits: options.maximumFractionDigits ?? Math.max(standard.maximumFractionDigits ?? 0, precision) })
  const digitFormatter = construct(locale, { useGrouping: false })
  const integerFormatter = construct(locale, { useGrouping: true, maximumFractionDigits: 0 })
  const sample = construct(locale, { ...options, useGrouping: true, minimumFractionDigits: 1, maximumFractionDigits: 1 }).formatToParts(-12345678.9)
  const valueOf = (type: string) => sample.find((part) => part.type === type)?.value ?? ''
  const decimal = valueOf('decimal') || '.'
  const group = valueOf('group').replace(whitespace, '')
  const minusSigns = Array.from(new Set(['-', '−', valueOf('minusSign').replace(directionMarks, '')])).filter(Boolean)
  const digits = new Map(Array.from({ length: 10 }, (_, digit) => [digitFormatter.format(digit), String(digit)]))
  const symbols = Array.from(new Set(sample.filter((part) => symbolTypes.has(part.type)).map((part) => part.value.replace(directionMarks, '').replace(whitespace, ''))))
    .filter(Boolean)
    .sort((first, second) => second.length - first.length)
  const resolved = formatter.resolvedOptions()
  const fractionDigits = resolved.maximumFractionDigits ?? 0
  const standardGroups = new RegExp(`^\\d{1,3}(?:${escapePattern(group)}\\d{3})+$`)

  const clean = (text: string) => {
    const withoutSymbols = symbols.reduce(removeAll, text.replace(directionMarks, '')).replace(whitespace, '')

    return Array.from(withoutSymbols, (character) => digits.get(character) ?? character).join('')
  }

  const split = (text: string) => {
    const cleaned = clean(text)
    const sign = minusSigns.find((candidate) => cleaned.startsWith(candidate))
    const unsigned = sign ? cleaned.slice(sign.length) : cleaned

    return { negative: sign !== undefined, unsigned, valid: !minusSigns.some((candidate) => unsigned.includes(candidate)) }
  }

  const toPlain = (unsigned: string) => {
    if (!group || !unsigned.includes(group)) return unsigned.split(decimal).join('.')

    const [integerText, ...fraction] = unsigned.split(decimal)
    const compact = removeAll(integerText, group)
    const grouped = standardGroups.test(integerText) || clean(integerFormatter.format(Number(compact))) === integerText

    if (grouped) return [compact, ...fraction].join('.')

    return fraction.length === 0 && integerText.split(group).length === 2 ? integerText.replace(group, '.') : ''
  }

  const parse = (text: string) => {
    const { negative, unsigned, valid } = split(text)
    const plain = toPlain(unsigned)

    if (!valid || !plainNumber.test(plain) || !/\d/.test(plain)) return Number.NaN

    const value = Number(resolved.style === 'percent' ? `${plain}e-2` : plain)

    if (!Number.isFinite(value)) return Number.NaN

    return (negative ? -value : value) + 0
  }

  const isPartial = (text: string, allowNegative = true) => {
    const { negative, unsigned, valid } = split(text)
    const plain = removeAll(unsigned, group).split(decimal).join('.')

    return valid && (allowNegative || !negative) && plainNumber.test(plain) && (fractionDigits > 0 || !plain.includes('.'))
  }

  const format = (value: number) => formatter.format(value)

  const normalize = (value: number) => {
    const parsed = parse(format(value))

    return (Number.isNaN(parsed) ? value : parsed) + 0
  }

  return { decimal, group, fractionDigits, format, parse, normalize, isPartial }
}
