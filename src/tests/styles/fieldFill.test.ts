import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { hookUses } from './hooks.ts'

const root = path.resolve(__dirname, '../../components/common')

const fields = ['Input', 'Textarea', 'NumberInput', 'Select', 'DatePicker', 'Combobox']

const backgrounds = ['--enchase-input-field-background', '--enchase-input-field-background-hover', '--enchase-input-field-background-focus', '--enchase-input-field-background-disabled']

const filled: Record<string, string> = {
  '--enchase-input-field-background-filled': 'var(--enchase-color-surface-container)',
  '--enchase-input-field-background-filled-hover': 'var(--enchase-color-surface-container-high)',
  '--enchase-input-field-background-filled-focus': 'var(--enchase-input-field-background-filled, var(--enchase-color-surface-container))',
  '--enchase-input-field-background-filled-disabled': 'color-mix(in srgb, var(--enchase-color-text-primary) calc(var(--enchase-state-disabled-container, 0.12) * 100%), transparent)'
}

describe('the fill of the fields', () => {
  const files = fields.map((name) => [name, readFileSync(path.join(root, name, 'styles.module.css'), 'utf8')] as const)

  it('reads the four background hooks in every field, with the transparent background of today as the fallback', () => {
    for (const [name, css] of files) {
      const uses = hookUses(css)

      for (const hook of backgrounds) {
        const found = uses.filter((use) => use.name === hook)

        expect(found.length, `${name} ${hook}`).toBeGreaterThan(0)
        expect(found.filter((use) => use.fallback !== 'transparent'), `${name} ${hook}`).toEqual([])
      }
    }
  })

  it('reads the four background hooks of the filled variant in every field, from the surface roles that the contrast checks of the theme cover and the disabled layer of the state tokens', () => {
    for (const [name, css] of files) {
      const uses = hookUses(css)

      for (const [hook, fallback] of Object.entries(filled)) {
        const found = uses.filter((use) => use.name === hook)

        expect(found.length, `${name} ${hook}`).toBeGreaterThan(0)
        expect(found.filter((use) => use.fallback !== fallback), `${name} ${hook}`).toEqual([])
      }
    }
  })

  it('only reads the background hooks, never declares them', () => {
    const declaring = files.filter(([, css]) => /^\s*--enchase-input-field-background[a-z-]*:/m.test(css)).map(([name]) => name)

    expect(declaring).toEqual([])
  })
})
