import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { hookUses, withoutVariables } from './hooks.ts'

const root = path.resolve(__dirname, '../../components/common')

const fields = ['Input', 'NumberInput', 'Select', 'Textarea']

const hooks: Record<string, string> = {
  '--enchase-input-min-width': '200px',
  '--enchase-input-padding-inline': 'var(--enchase-space-md)',
  '--enchase-input-font-size': 'var(--enchase-font-size-base)',
  '--enchase-input-height': '3.5rem',
  '--enchase-textarea-padding-block': 'var(--enchase-space-md)',
  '--enchase-textarea-min-height': '3.5rem'
}

const geometry = /^(?:min-inline-size|max-inline-size|padding-block|padding-inline|padding-inline-end|font-size|inset-inline-start|transform)$/

const fixed: Record<string, string[]> = {
  'Input/styles.module.css': ['max-inline-size: 0.01px'],
  'NumberInput/styles.module.css': ['max-inline-size: 0.01px'],
  'Select/styles.module.css': ['padding-inline: var(--enchase-input-padding-inline, var(--enchase-space-md)) 2.75rem', 'max-inline-size: calc(100% - 4rem)', 'max-inline-size: 0.01px'],
  'Textarea/styles.module.css': ['transform: translateY(-0.75rem) scale(0.75)', 'max-inline-size: 0.01px']
}

const length = /\d(?:\.\d+)?(?:px|rem|em)\b/

const floors = /max\((?:24|16)px,/g

const floor = (property: string, value: string) => property.startsWith('min-') && value === '24px'

const declarationsOf = (css: string) => [...css.matchAll(/^\s*([a-z-]+):\s*([^;]+);/gm)].map(([, property, value]) => ({ property, value: value.trim() }))

describe('the geometry of the fields', () => {
  const files = fields.map((name) => [`${name}/styles.module.css`, readFileSync(path.join(root, name, 'styles.module.css'), 'utf8')] as const)
  const uses = files.flatMap(([, css]) => hookUses(css))

  it('writes no width, padding, font size or label position in a number, apart from the floors, the notch of the label, the room kept for the arrow of the select and the offset of the label of the textarea', () => {
    const literal = Object.fromEntries(
      files
        .map(
          ([name, css]) =>
            [
              name,
              declarationsOf(css)
                .filter(({ property, value }) => geometry.test(property) && !floor(property, value) && length.test(withoutVariables(value).replace(floors, '')))
                .map(({ property, value }) => `${property}: ${value}`)
            ] as const
        )
        .filter(([, list]) => list.length > 0)
    )

    expect(literal).toEqual(fixed)
  })

  it('gives every use of a hook the same default everywhere, so a field keeps its size when the hook is not set', () => {
    for (const [name, fallback] of Object.entries(hooks)) {
      const found = uses.filter((use) => use.name === name)

      expect(found.length, name).toBeGreaterThan(0)
      expect(found.filter((use) => use.fallback !== fallback), name).toEqual([])
    }
  })

  it('places the floating label from the height of the field instead of half of its default', () => {
    for (const name of ['Input', 'NumberInput', 'Select']) {
      const css = files.find(([file]) => file.startsWith(`${name}/`))?.[1] ?? ''

      expect(css, name).not.toContain('28px')
      expect(css, name).toContain('translateY(calc(-50% - var(--enchase-input-height, 3.5rem) / 2)) scale(0.75)')
    }
  })

  it('keeps the room of the buttons inside a field from the target size, so a bigger target does not cover the text', () => {
    const input = files.find(([file]) => file.startsWith('Input/'))?.[1] ?? ''
    const number = files.find(([file]) => file.startsWith('NumberInput/'))?.[1] ?? ''

    expect(input).toContain('padding-inline-end: calc(var(--enchase-space-sm) * 2 + max(24px, var(--enchase-hit-size, 40px)))')
    expect(number).toContain('padding-inline-end: calc(max(24px, var(--enchase-hit-size, 40px)) * 2 + var(--enchase-space-xs) + var(--enchase-space-sm) * 2)')
    expect(number).not.toContain('80px')
    expect(number).not.toContain('7rem')
  })

  it('only reads the hooks, never declares them', () => {
    const declaring = files.filter(([, css]) => /^\s*--enchase-(?:input|textarea)-[a-z-]+:/m.test(css)).map(([name]) => name)

    expect(declaring).toEqual([])
  })
})
