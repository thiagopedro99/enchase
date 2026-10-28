import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { layoutVariables } from '@styles/css/declarations.ts'
import { baseTokens } from '@styles/tokens/index.ts'

const defaults = layoutVariables(baseTokens)

const rolesOf = (selector: string) => {
  const plain = selector.replace(/:not\([^)]*\)/g, '')

  if (/:disabled/.test(plain)) return ['disabled-container', 'disabled-content']
  if (/:active/.test(plain)) return ['pressed']
  if (/:hover|:focus-visible|\[data-active\]/.test(plain)) return ['hover', 'row-hover']

  return []
}

const root = path.resolve(__dirname, '../../components')

const cssFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)

    return statSync(full).isDirectory() ? cssFiles(full) : full.endsWith('.module.css') ? [full] : []
  })

const relative = (file: string) => path.relative(root, file).split(path.sep).join('/')

const mixes = (css: string) =>
  [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].flatMap(([, selector, body]) =>
    [...body.matchAll(/^\s*([a-z-]+):\s*([^;]+);/gm)]
      .filter(([, , value]) => value.includes('color-mix(in srgb,'))
      .flatMap(([, property, value]) =>
        [...value.matchAll(/ (calc\(var\(--enchase-state-([a-z-]+), ([0-9.]+)\) \* 100%\)|[0-9.]+%), transparent\)/g)].map(([, strength, role, fallback]) => ({ selector: selector.trim(), property, value, strength, role, fallback }))
      )
  )

describe('the state layers of the components', () => {
  const files = cssFiles(root).map((file) => [relative(file), readFileSync(file, 'utf8')] as const)

  it('mixes every hover, pressed and disabled color from the state tokens, with no percentage written in the component', () => {
    const literal = Object.fromEntries(
      files
        .map(([name, css]) => [name, mixes(css).filter(({ role }) => role === undefined).map(({ strength }) => strength)] as const)
        .filter(([, list]) => list.length > 0)
    )

    expect(literal).toEqual({})
  })

  it('gives every use of a state token the default of the token as fallback, so a component keeps its layers when the theme variables are not there', () => {
    const used = files.flatMap(([name, css]) => mixes(css).filter(({ role }) => role !== undefined).map((mix) => ({ name, ...mix })))

    expect(used.length).toBeGreaterThan(0)
    expect(used.filter(({ role }) => defaults[`--enchase-state-${role}`] === undefined)).toEqual([])
    expect(used.filter(({ role, fallback }) => fallback !== defaults[`--enchase-state-${role}`])).toEqual([])
  })

  it('uses the token of the state the selector is about: pressed for :active, disabled for :disabled, hover for :hover', () => {
    const used = files.flatMap(([name, css]) => mixes(css).filter(({ role }) => role !== undefined).map((mix) => ({ name, ...mix })))

    expect(used.filter(({ selector, role }) => !rolesOf(selector).includes(role))).toEqual([])
  })

  it('draws the halo of the selection controls from the halo tokens', () => {
    const halos = files.flatMap(([name, css]) => [...css.matchAll(/^\s*box-shadow:\s*0 0 0 ([^ ]+(?: [^ ]+)?) color-mix/gm)].map(([, size]) => ({ name, size })))
    const sizes = [`var(--enchase-halo-size, ${defaults['--enchase-halo-size']})`, `var(--enchase-halo-size-switch, ${defaults['--enchase-halo-size-switch']})`]

    expect(halos.length).toBeGreaterThan(0)
    expect(halos.filter(({ size }) => !sizes.includes(size))).toEqual([])
  })

  it('only reads the state and halo tokens, never declares them', () => {
    const declaring = files.filter(([, css]) => /^\s*--enchase-(?:state|halo)-/m.test(css)).map(([name]) => name)

    expect(declaring).toEqual([])
  })
})
