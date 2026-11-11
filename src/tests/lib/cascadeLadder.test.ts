import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import postcss from 'postcss'
import { describe, expect, it } from 'vitest'

import cascadeLadder, { CascadeLadderError, ladderProblems, ladderSelector, ladderValue, specificityOf } from '../../../scripts/cascadeLadder.mjs'

const run = (css: string, file = '/repo/src/components/common/Button/styles.module.css') => postcss([cascadeLadder()]).process(css, { from: file }).css

describe('specificityOf', () => {
  it.each([
    ['.a', [0, 1, 0]],
    ['a', [0, 0, 1]],
    ['a.b:hover', [0, 2, 1]],
    ['#x', [1, 0, 0]],
    ['*', [0, 0, 0]],
    [':where(.a .b)', [0, 0, 0]],
    [':is(.a, b)', [0, 1, 0]],
    [':not(.a .b)', [0, 2, 0]],
    [':has(> li)', [0, 0, 1]],
    ['a::before', [0, 0, 2]],
    ['::selection', [0, 0, 1]],
    ['a:before', [0, 0, 2]],
    ['a:first-line', [0, 0, 2]]
  ])('%s has the specificity %j', (selector, expected) => {
    expect(specificityOf(selector)).toEqual(expected)
  })
})

describe('ladderValue', () => {
  it.each([
    [0, 0, 2],
    [0, 1, 3],
    [0, 2, 4],
    [1, 0, 5],
    [2, 2, 10],
    [7, 0, 23]
  ])('f(b=%i, c=%i) is %i', (b, c, n) => {
    expect(ladderValue(b, c)).toBe(n)
  })

  it('keeps the order of (b, c) for every pair the library can produce', () => {
    const pairs = Array.from({ length: 8 }, (_, b) => Array.from({ length: 3 }, (_, c) => ({ b, c, n: ladderValue(b, c) }))).flat()

    for (const left of pairs) {
      for (const right of pairs) {
        if (left.b < right.b || (left.b === right.b && left.c < right.c)) expect(left.n).toBeLessThan(right.n)
      }
    }
  })

  it('refuses c of 3 or more', () => {
    expect(() => ladderValue(0, 3)).toThrow(CascadeLadderError)
  })
})

describe('ladderSelector', () => {
  it.each([
    ['.a', ':where(.a):not(_ _ _ _ _)', [0, 0, 5]],
    ['a::before', ':where(a):not(_ _ _)::before', [0, 0, 4]],
    ['::selection', ':where(*):not(_ _)::selection', [0, 0, 3]],
    ['.a > .b', ':where(.a > .b):not(_ _ _ _ _ _ _ _)', [0, 0, 8]],
    [':is(.a, b)', ':where(:is(.a, b)):not(_ _ _ _ _)', [0, 0, 5]],
    [':not(.a .b)', ':where(:not(.a .b)):not(_ _ _ _ _ _ _ _)', [0, 0, 8]]
  ])('%s becomes %s with specificity %j', (selector, text, expected) => {
    expect(ladderSelector(selector)).toBe(text)
    expect(specificityOf(ladderSelector(selector))).toEqual(expected)
  })

  it.each([
    ['#x'],
    ['div span a'],
    ['a b::after'],
    ['> a'],
    ['a::before b'],
    ['.a > ::before'],
    ['.a &']
  ])('refuses %s instead of passing it through', (selector) => {
    expect(() => ladderSelector(selector)).toThrow(CascadeLadderError)
  })
})

describe('the postcss plugin', () => {
  it('rewrites every selector of a rule in the library folder', () => {
    expect(run('.a, b > .c { color: red }')).toBe(`${ladderSelector('.a')}, ${ladderSelector('b > .c')} { color: red }`)
  })

  it('walks the rules inside @media, @supports and @layer', () => {
    const css = run('@media (width > 1px) { .a { color: red } } @supports (display: grid) { .b { color: red } } @layer enchase { .c { color: red } }')

    expect(css).toContain(`${ladderSelector('.a')} {`)
    expect(css).toContain(`${ladderSelector('.b')} {`)
    expect(css).toContain(`${ladderSelector('.c')} {`)
  })

  it('leaves the keyframe selectors alone', () => {
    expect(run('@keyframes spin { from { opacity: 0 } 50% { opacity: .5 } to { opacity: 1 } }')).toBe('@keyframes spin { from { opacity: 0 } 50% { opacity: .5 } to { opacity: 1 } }')
  })

  it('ignores files outside the library folder', () => {
    expect(run('.a { color: red }', '/repo/src/docs/LiveStrip/styles.module.css')).toBe('.a { color: red }')
  })

  it('recognises windows paths', () => {
    expect(run('.a { color: red }', 'C:\\repo\\src\\components\\common\\Button\\styles.module.css')).toBe(`${ladderSelector('.a')} { color: red }`)
  })

  it('fails the build on a selector it cannot ladder', () => {
    expect(() => run('#x { color: red }')).toThrow(CascadeLadderError)
  })
})

describe('ladderProblems', () => {
  it('reports the selectors of a stylesheet that are not on the ladder', () => {
    expect(ladderProblems(':where(.a):not(_ _ _ _ _) { color: red } .b { color: red } h1 { color: red }')).toEqual(['.b', 'h1'])
  })
})

const componentsDir = path.resolve(__dirname, '../../components')

const cssFilesIn = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name)

    if (entry.isDirectory()) return cssFilesIn(file)

    return entry.name.endsWith('.module.css') ? [file] : []
  })

const librarySelectors = () =>
  cssFilesIn(componentsDir).flatMap((file) => {
    const selectors: string[] = []

    postcss.parse(readFileSync(file, 'utf8')).walkRules((rule) => {
      if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return

      selectors.push(...rule.selectors)
    })

    return selectors
  })

describe('the order of the library on the ladder', () => {
  it('gives every selector of the library a rung, and the rungs keep the order of the original specificity', () => {
    const rungs = new Map<string, Set<number>>()

    for (const selector of librarySelectors()) {
      const key = specificityOf(selector).join(',')

      rungs.set(key, (rungs.get(key) ?? new Set<number>()).add(specificityOf(ladderSelector(selector))[2]))
    }

    const entries = [...rungs]
      .map(([key, values]) => ({ original: key.split(',').map(Number), values: [...values] }))
      .sort((left, right) => left.original[1] - right.original[1] || left.original[2] - right.original[2])

    expect(entries.length).toBeGreaterThan(1)
    expect(entries.every((entry) => entry.values.length === 1)).toBe(true)

    const ladder = entries.map((entry) => entry.values[0] as number)

    expect(ladder).toEqual([...ladder].sort((left, right) => left - right))
    expect(new Set(ladder).size).toBe(ladder.length)
  })
})
