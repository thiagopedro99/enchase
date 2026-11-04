import { describe, expect, it } from 'vitest'

const sources = import.meta.glob(
  ['/src/components/**/*.{ts,tsx}', '/src/hooks/**/*.{ts,tsx}', '/src/utils/**/*.{ts,tsx}', '/src/motion/**/*.{ts,tsx}', '/src/positioning/**/*.{ts,tsx}', '/src/styles/**/*.{ts,tsx}', '/src/locales/**/*.{ts,tsx}', '!**/*.stories.*'],
  { query: '?raw', import: 'default', eager: true }
) as Record<string, string>

const kinds: [string, RegExp][] = [
  ['let', /^(?:export )?(?:let|var) (\w+)/],
  ['context', /^(?:export )?const (\w+)(?:: [^=]+)? = createContext\b/],
  ['collection', /^(?:export )?const (\w+)(?:: [^=]+)? = new (?:Map|Set|WeakMap|WeakSet)\b/],
  ['empty', /^(?:export )?const (\w+)(?:: [^=]+)? = (?:\[\]|\{\})$/]
]

const allowed: Record<string, string> = {
  'src/components/footer/defaultData.ts:defaultLinks': 'an empty default that nothing writes to',
  'src/components/layout/defaultData.ts:defaultNavigationSections': 'an empty default that nothing writes to',
  'src/styles/theme/createTheme.ts:noStyle': 'an empty style that nothing writes to',
  'src/styles/theme/style.ts:validated': 'a cache of the objects already validated: one for each copy only repeats the work',
  'src/utils/dateFormat.ts:nativeDigits': 'the digits of the locale, found once for each copy',
  'src/utils/dateFormat.ts:formatters': 'a cache of formatters: one for each copy only repeats the work',
  'src/utils/firstDayOfWeek.ts:sundayRegions': 'a table that nothing writes to',
  'src/utils/firstDayOfWeek.ts:saturdayRegions': 'a table that nothing writes to',
  'src/utils/firstDayOfWeek.ts:fridayRegions': 'a table that nothing writes to',
  'src/utils/numberFormat.ts:symbolTypes': 'a table that nothing writes to'
}

const found = Object.entries(sources).flatMap(([path, text]) =>
  text.split('\n').flatMap((line, index) =>
    kinds.flatMap(([kind, pattern]) => {
      const name = pattern.exec(line)?.[1]

      return name ? [{ key: `${path.slice(1)}:${name}`, where: `${path.slice(1)}:${index + 1}`, kind }] : []
    })
  )
)

describe('the state that a module keeps at its top', () => {
  it('lives in shared() unless it is a table or a cache that nothing outside the module reads, so a copy of the module sees the state of the package', () => {
    const loose = found.filter(({ key }) => !(key in allowed)).map(({ where, kind }) => `${where} (${kind})`)

    expect(loose).toEqual([])
  })

  it('has no exception for a declaration that is gone', () => {
    const keys = new Set(found.map(({ key }) => key))

    expect(Object.keys(allowed).filter((key) => !keys.has(key))).toEqual([])
  })

  it('gives every shared() value a name of its own, with a version', () => {
    const names = Object.values(sources).flatMap((text) => [...text.matchAll(/\bshared\(\s*'([^']+)'/g)].map((match) => match[1]))

    expect(names.length).toBeGreaterThan(10)
    expect(names.filter((name) => !/^[a-z][A-Za-z]*\.v\d+$/.test(name))).toEqual([])
    expect(names.filter((name, index) => names.indexOf(name) !== index)).toEqual([])
  })
})
