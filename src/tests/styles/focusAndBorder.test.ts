import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { layoutVariables } from '@styles/css/declarations.ts'
import { baseTokens } from '@styles/tokens/index.ts'

const glyphs: Record<string, string[]> = {
  'common/Select/styles.module.css': ['border-inline-start: 5px solid transparent', 'border-inline-end: 5px solid transparent', 'border-block-start: 5px solid currentColor']
}

const defaults = layoutVariables(baseTokens)

const token = (name: string) => `var(--enchase-${name}, ${defaults[`--enchase-${name}`]})`

const fieldFiles = ['common/Input', 'common/NumberInput', 'common/Select', 'common/Textarea'].map((name) => `${name}/styles.module.css`)

const forcedColorsFloor = `border-width: max(${token('border-width-strong')}, ${defaults['--enchase-border-width-strong']})`

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const ring = new RegExp(`^${escape(token('focus-width'))} solid (?:var\\(--enchase-focus-color, var\\(--enchase-color-primary\\)\\)|currentColor)$`)

const offsets = ['0', token('focus-offset'), token('focus-offset-inset'), token('focus-offset-selector')]

const root = path.resolve(__dirname, '../../components')

const cssFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)

    return statSync(full).isDirectory() ? cssFiles(full) : full.endsWith('.module.css') ? [full] : []
  })

const relative = (file: string) => path.relative(root, file).split(path.sep).join('/')

const declarationsOf = (css: string, property: RegExp) =>
  [...css.matchAll(/^\s*([a-z-]+):\s*([^;]+);/gm)].filter(([, name]) => property.test(name)).map(([, name, value]) => ({ name, value: value.trim() }))

const withoutVariables = (value: string): string => {
  const plain = value.replace(/var\([^()]*\)/g, '')

  return plain === value ? plain : withoutVariables(plain)
}

const length = /\d(?:\.\d+)?(?:px|rem|em)\b/

describe('the focus ring and the border width of the components', () => {
  const files = cssFiles(root).map((file) => [relative(file), readFileSync(file, 'utf8')] as const)

  it('draws every focus ring from the focus tokens, apart from the outline that is turned off where the focus shows in another way', () => {
    const rings = files.flatMap(([name, css]) => declarationsOf(css, /^outline$/).map(({ value }) => ({ name, value })))

    expect(rings.filter(({ value }) => value !== 'none').length).toBeGreaterThan(0)
    expect(rings.filter(({ value }) => value !== 'none' && !ring.test(value))).toEqual([])
  })

  it('places every focus ring with one of the offset tokens', () => {
    const placed = files.flatMap(([name, css]) => declarationsOf(css, /^outline-offset$/).map(({ value }) => ({ name, value })))

    expect(placed.length).toBeGreaterThan(0)
    expect(placed.filter(({ value }) => !offsets.includes(value))).toEqual([])
  })

  it('takes every border width from the border tokens, except the glyphs drawn with borders', () => {
    const fixed = Object.fromEntries(
      files
        .map(
          ([name, css]) =>
            [
              name,
              declarationsOf(css, /^border(?:-(?:block|inline)-(?:start|end)|-(?:top|right|bottom|left))?(?:-width)?$/)
                .filter(({ value }) => length.test(withoutVariables(value)))
                .map(({ name: property, value }) => `${property}: ${value}`)
                .filter((declaration) => declaration !== forcedColorsFloor)
            ] as const
        )
        .filter(([, list]) => list.length > 0)
    )

    expect(fixed).toEqual(glyphs)
  })

  it('keeps the focus border of every field at the strong width or more in forced colors, where the ring made with a shadow is gone', () => {
    const floor = new RegExp(`@media \\(forced-colors: active\\) \\{[^{]*\\{\\s*${escape(forcedColorsFloor)};`)

    expect(files.filter(([name, css]) => fieldFiles.includes(name) && !floor.test(css)).map(([name]) => name)).toEqual([])
    expect(files.filter(([name, css]) => !fieldFiles.includes(name) && css.includes(forcedColorsFloor)).map(([name]) => name)).toEqual([])
  })

  it('draws the hairlines made with a shadow from the border width token', () => {
    const fixed = files.filter(([, css]) => /inset 0 -1px 0/.test(css)).map(([name]) => name)

    expect(fixed).toEqual([])
  })

  it('gives every use of a focus or border token the default of the token as fallback, so a component keeps its ring and its border when the theme variables are not there', () => {
    const uses = files.flatMap(([name, css]) => [...css.matchAll(/var\((--enchase-(?:focus|border)-[a-z-]+)(?:,\s*([^)]*))?\)/g)].map(([, variable, fallback]) => ({ name, variable, fallback })))
    const own = uses.filter(({ variable }) => variable !== '--enchase-focus-color')

    expect(own.length).toBeGreaterThan(0)
    expect(own.filter(({ variable }) => defaults[variable] === undefined)).toEqual([])
    expect(own.filter(({ variable, fallback }) => fallback !== defaults[variable])).toEqual([])
  })

  it('only reads the focus and border tokens, never declares them', () => {
    const declaring = files.filter(([, css]) => /^\s*--enchase-(?:focus|border)-/m.test(css)).map(([name]) => name)

    expect(declaring).toEqual([])
  })
})
