import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { hookUses, withoutVariables } from './hooks.ts'

const root = path.resolve(__dirname, '../../components')

const controls = ['common/Checkbox', 'common/RadioGroup', 'common/Switch']

const hooks: Record<string, string> = {
  '--enchase-checkbox-box-size': '18px',
  '--enchase-checkbox-box-check-width': '2px',
  '--enchase-radio-group-control-size': '1.25rem',
  '--enchase-radio-group-control-dot-size': 'calc(var(--enchase-radio-group-control-size, 1.25rem) / 2)',
  '--enchase-switch-track-width': '3.25rem',
  '--enchase-switch-track-height': '2rem',
  '--enchase-switch-thumb-size': '1.5rem',
  '--enchase-switch-thumb-inset': '0.125rem',
  '--enchase-switch-thumb-scale-off': '0.667'
}

const geometry = /^(?:inline-size|block-size|inset-inline-start|margin-block-start|border-width|border)$/

const length = /\d(?:\.\d+)?(?:px|rem|em)\b/

const declarationsOf = (css: string) => [...css.matchAll(/^\s*([a-z-]+):\s*([^;]+);/gm)].map(([, property, value]) => ({ property, value: value.trim() }))

describe('the geometry of the checkbox, the radio and the switch', () => {
  const files = controls.map((name) => [name, readFileSync(path.join(root, name, 'styles.module.css'), 'utf8')] as const)
  const uses = files.flatMap(([, css]) => hookUses(css))

  it('writes no size, inset or border width in a number, only inside the hooks and the derivations', () => {
    const fixed = files.flatMap(([name, css]) =>
      declarationsOf(css)
        .filter(({ property, value }) => geometry.test(property) && length.test(withoutVariables(value)))
        .map(({ property, value }) => `${name} ${property}: ${value}`)
    )

    expect(fixed).toEqual([])
  })

  it('gives every use of a hook the same default everywhere, so the control keeps its size when the hook is not set', () => {
    for (const [name, fallback] of Object.entries(hooks)) {
      const found = uses.filter((use) => use.name === name)

      expect(found.length, name).toBeGreaterThan(0)
      expect(found.filter((use) => use.fallback !== fallback), name).toEqual([])
    }
  })

  it('has no geometry hook that the list above does not know', () => {
    const known = new Set(Object.keys(hooks))
    const names = [...new Set(uses.map(({ name }) => name))].filter((name) => /^--enchase-(?:checkbox|radio-group|switch)-(?:[a-z-]+-)?(?:(?<!font-)size|width|height|inset|scale-off)$/.test(name))

    expect(names.filter((name) => !known.has(name))).toEqual([])
  })

  it('only reads the hooks, never declares them', () => {
    const declaring = files.filter(([, css]) => /^\s*--enchase-(?:checkbox|radio-group|switch)-[a-z-]+:/m.test(css)).map(([name]) => name)

    expect(declaring).toEqual([])
  })
})
