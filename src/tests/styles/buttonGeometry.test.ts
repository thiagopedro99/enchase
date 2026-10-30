import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { hookUses } from './hooks.ts'

const css = readFileSync(path.resolve(__dirname, '../../components/common/Button/styles.module.css'), 'utf8')

const hooks: Record<string, string> = {
  '--enchase-button-gap': 'var(--enchase-space-sm)',
  '--enchase-button-font-weight': 'var(--enchase-font-weight-semibold)',
  '--enchase-button-padding-block-sm': 'var(--enchase-space-xs)',
  '--enchase-button-padding-block-md': 'var(--enchase-space-xs)',
  '--enchase-button-padding-block-lg': 'var(--enchase-space-xs)',
  '--enchase-button-padding-inline-sm': 'var(--enchase-space-md)',
  '--enchase-button-padding-inline-md': 'var(--enchase-space-lg)',
  '--enchase-button-padding-inline-lg': 'var(--enchase-space-xl)',
  '--enchase-button-padding-inline-ghost': 'var(--enchase-space-md)',
  '--enchase-button-padding-inline-ghost-sm': 'var(--enchase-button-padding-inline-ghost, var(--enchase-space-md))',
  '--enchase-button-padding-inline-ghost-md': 'var(--enchase-button-padding-inline-ghost, var(--enchase-space-md))',
  '--enchase-button-padding-inline-ghost-lg': 'var(--enchase-button-padding-inline-ghost, var(--enchase-space-md))',
  '--enchase-button-font-size-sm': 'var(--enchase-font-size-sm)',
  '--enchase-button-font-size-md': 'var(--enchase-font-size-sm)',
  '--enchase-button-font-size-lg': 'var(--enchase-font-size-base)'
}

const declarations = [...css.matchAll(/^\s*([a-z-]+):\s*([^;]+);/gm)].map(([, property, value]) => ({ property, value: value.trim() }))

const uses = hookUses(css)

describe('the geometry of the button', () => {
  it('reads the gap, the padding, the font size and the weight from the hooks, with no scale token written on its own', () => {
    const own = declarations.filter(({ property }) => /^(?:gap|padding-block|padding-inline|font-size|font-weight)$/.test(property))

    expect(own.length).toBeGreaterThan(0)
    expect(own.filter(({ value }) => !value.startsWith('var(--enchase-button-'))).toEqual([])
  })

  it('gives every use of a hook the scale token it read before as fallback, so the button keeps its size when the hook is not set', () => {
    for (const [name, fallback] of Object.entries(hooks)) {
      const found = uses.filter((use) => use.name === name)

      expect(found.length, name).toBeGreaterThan(0)
      expect(found.filter((use) => use.fallback !== fallback), name).toEqual([])
    }
  })

  it('has no geometry hook that the list above does not know', () => {
    const names = [...new Set(uses.map(({ name }) => name))].filter((name) => /^--enchase-button-(?:gap|font-weight|padding-[a-z-]+|font-size-[a-z]+)$/.test(name))

    expect(names.filter((name) => !(name in hooks))).toEqual([])
  })

  it('only reads the hooks, never declares them', () => {
    expect(/^\s*--enchase-button-[a-z-]+:/m.test(css)).toBe(false)
  })
})
