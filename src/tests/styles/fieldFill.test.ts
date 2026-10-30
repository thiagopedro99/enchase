import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { hookUses } from './hooks.ts'

const root = path.resolve(__dirname, '../../components/common')

const fields = ['Input', 'Textarea', 'NumberInput', 'Select', 'DatePicker', 'Combobox']

const backgrounds = ['--enchase-input-field-background', '--enchase-input-field-background-hover', '--enchase-input-field-background-focus', '--enchase-input-field-background-disabled']

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

  it('only reads the background hooks, never declares them', () => {
    const declaring = files.filter(([, css]) => /^\s*--enchase-input-field-background[a-z-]*:/m.test(css)).map(([name]) => name)

    expect(declaring).toEqual([])
  })
})
