import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { fontVariables, layoutVariables } from '@styles/css/declarations.ts'
import { baseTokens } from '@styles/tokens/index.ts'
import { hookUses } from './hooks.ts'

const fixed: Record<string, string[]> = {
  'common/Breadcrumbs/styles.module.css': ['line-height: 28px'],
  'common/Input/styles.module.css': ['font-size: var(--enchase-font-size-base)', 'font-weight: var(--enchase-font-weight-regular)', 'font-size: var(--enchase-font-size-xs)'],
  'common/NumberInput/styles.module.css': ['font-size: var(--enchase-font-size-base)', 'font-weight: var(--enchase-font-weight-regular)', 'font-size: var(--enchase-font-size-xs)'],
  'common/Select/styles.module.css': ['font-size: var(--enchase-font-size-base)', 'font-weight: var(--enchase-font-weight-regular)', 'font-size: var(--enchase-font-size-xs)'],
  'common/Textarea/styles.module.css': ['font-size: var(--enchase-font-size-base)', 'font-weight: var(--enchase-font-weight-regular)', 'line-height: 1.5', 'font-size: var(--enchase-font-size-xs)']
}

const notSlots = ['radio-group-dot', 'select-option', 'select-picker', 'number-input-stepper', 'pagination-control', 'navbar-menu-link']

const typography = /^(?:font-size|font-weight|line-height|letter-spacing|text-underline-offset)$/

const shape = /^border(?:-(?:start|end)-(?:start|end))?-radius$/

const mechanics = /^(?:inherit|50%|0)$/

const property = /^--enchase-(.+?)-(font-size|font-weight|line-height|letter-spacing|underline-offset|radius(?:-start-start|-start-end|-end-start|-end-end)?)(?:-[a-z-]+)?$/

const tokens = { ...fontVariables(baseTokens.fonts), ...layoutVariables(baseTokens) }

const root = path.resolve(__dirname, '../../components')

const walk = (dir: string, extension: RegExp): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)

    return statSync(full).isDirectory() ? walk(full, extension) : extension.test(full) ? [full] : []
  })

const relative = (file: string) => path.relative(root, file).split(path.sep).join('/')

const declarationsOf = (css: string) => [...css.matchAll(/^\s*([a-z-]+):\s*([^;]+);/gm)].map(([, name, value]) => ({ property: name, value: value.trim() }))

describe('the typography and the shape of the components', () => {
  const files = walk(root, /\.module\.css$/).map((file) => [relative(file), readFileSync(file, 'utf8')] as const)
  const uses = files.flatMap(([name, css]) => hookUses(css).filter((use) => property.test(use.name)).map((use) => ({ file: name, ...use })))
  const slots = new Set(
    walk(root, /\.tsx$/).flatMap((file) => [...readFileSync(file, 'utf8').matchAll(/slot\('([a-z-]+)'(?:,\s*'([a-z-]+)')?\)/g)].map(([, component, part]) => (part ? `${component}-${part}` : component)))
  )

  it('reads every font size, weight, line height, letter spacing and corner radius from a hook, and lists what is still fixed', () => {
    const bare = Object.fromEntries(
      files
        .map(
          ([name, css]) =>
            [
              name,
              declarationsOf(css)
                .filter(({ property: name }) => typography.test(name) || shape.test(name))
                .filter(({ value }) => !mechanics.test(value) && !/^(?:var\(--enchase-[a-z0-9-]+, |max\(16px, )/.test(value))
                .map(({ property: name, value }) => `${name}: ${value}`)
            ] as const
        )
        .filter(([, list]) => list.length > 0)
    )

    expect(uses.length).toBeGreaterThan(100)
    expect(bare).toEqual(fixed)
  })

  it('falls back to the scale token the property read before, or to the default of a line height or a letter spacing token, or to a plain value', () => {
    const wrong = uses.filter(({ fallback }) => {
      const scale = /^var\((--enchase-(?:font-size|font-weight|radius)-[a-z0-9]+)\)$/.exec(fallback)
      const shaped = /^var\((--enchase-(?:line-height|letter-spacing)-[a-z]+), ([^)]+)\)$/.exec(fallback)

      if (scale) return tokens[scale[1]] === undefined
      if (shaped) return tokens[shaped[1]] !== shaped[2]

      return /^var\(/.test(fallback)
    })

    expect(wrong).toEqual([])
  })

  it('gives every use of a hook the same fallback, so a hook shared by two rules moves both together', () => {
    const byName = new Map<string, Set<string>>()

    for (const { name, fallback } of uses) byName.set(name, (byName.get(name) ?? new Set()).add(fallback))

    expect([...byName.entries()].filter(([, fallbacks]) => fallbacks.size > 1).map(([name]) => name)).toEqual([])
  })

  it('names every hook after the data-slot of the part it styles, plus the property', () => {
    const subjects = [...new Set(uses.map(({ name }) => (property.exec(name) as RegExpExecArray)[1]))]

    expect(subjects.filter((subject) => !slots.has(subject) && !notSlots.includes(subject))).toEqual([])
    expect(notSlots.filter((subject) => slots.has(subject))).toEqual([])
  })

  it('shares one hook between the field and its outline, so the border and the input keep the same corners', () => {
    for (const name of ['Input', 'NumberInput', 'Select', 'Textarea']) {
      const css = files.find(([file]) => file.startsWith(`common/${name}/`))?.[1] ?? ''
      const radii = hookUses(css).filter((use) => /-field-radius$/.test(use.name))

      expect(radii.length, name).toBeGreaterThanOrEqual(2)
      expect(new Set(radii.map((use) => use.name)).size, name).toBe(1)
    }
  })

  it('only reads the hooks, never declares them', () => {
    const declaring = files.filter(([, css]) => /^\s*--enchase-[a-z-]+-(?:font-size|font-weight|line-height|letter-spacing|underline-offset|radius)[a-z-]*:/m.test(css)).map(([name]) => name)

    expect(declaring).toEqual([])
  })
})
