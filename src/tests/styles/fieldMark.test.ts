import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { hookUses } from './hooks.ts'

const root = path.resolve(__dirname, '../../components/common')

const fields = ['Input', 'Textarea', 'NumberInput', 'Select', 'DatePicker', 'Combobox']

const hooks: Record<string, string> = {
  '--enchase-input-required-color': 'var(--enchase-color-error)',
  '--enchase-input-required-gap': '0.25rem',
  '--enchase-input-required-display': 'inline'
}

describe('the required mark of the fields', () => {
  const files = fields.map((name) => [name, readFileSync(path.join(root, name, 'styles.module.css'), 'utf8')] as const)

  it('reads the color, the gap and the display of the mark from three hooks, with the color of the error, 0.25rem and inline as the fallback', () => {
    for (const [name, css] of files) {
      const uses = hookUses(css)

      for (const [hook, fallback] of Object.entries(hooks)) {
        const found = uses.filter((use) => use.name === hook)

        expect(found.length, `${name} ${hook}`).toBe(1)
        expect(found.filter((use) => use.fallback !== fallback), `${name} ${hook}`).toEqual([])
      }
    }
  })

  it('draws the star as the generated content of the mark, so that it is not a text of the label and the name read by a test stays the same', () => {
    for (const [name, css] of files) {
      expect(css, name).toContain(".required::after {\n  content: '*';\n}")
    }
  })

  it('styles the text of the notch on the direct span of the legend only, so the mark that sits inside it keeps its own style', () => {
    for (const [name, css] of files) {
      expect(css, name).toContain('.outline legend > span {')
      expect(css, name).toContain('.outline[data-has-label] legend > span {')
      expect(css, name).not.toMatch(/legend span/)
    }
  })

  it('only reads the hooks of the mark, never declares them', () => {
    const declaring = files.filter(([, css]) => /^\s*--enchase-input-required-[a-z-]+:/m.test(css)).map(([name]) => name)

    expect(declaring).toEqual([])
  })
})
