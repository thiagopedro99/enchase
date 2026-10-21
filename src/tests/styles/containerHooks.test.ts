import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { colorVariables, fontVariables, layoutVariables, shadowVariables } from '@styles/css/declarations.ts'
import { baseTokens, defaultTheme } from '@styles/tokens/index.ts'
import { isToken } from '../../../scripts/cssHooks.mjs'
import { hookUses, withoutHooks, withoutVariables } from './hooks.ts'

const scope = ['common/Accordion', 'common/Alert', 'common/Badge', 'common/Card', 'common/Modal', 'common/Table', 'common/Tabs', 'toast']

const fixed: Record<string, string[]> = {
  'common/Alert/styles.module.css': ['padding-block: calc((var(--alert-row-size) - 1.5em) / 2)'],
  'common/Modal/styles.module.css': ['inline-size: min(90%, 100% - 2rem)'],
  'common/Tabs/styles.module.css': ['inline-size: 1px'],
  'toast/styles.module.css': ['inline-size: min(360px, 100vw - 2em)', 'max-block-size: calc(100dvh - 2em)']
}

const notSlots = ['toast-body', 'toast-icon']

const typography = /(?:font-size|font-weight|line-height|letter-spacing|underline-offset|radius)/

const spacing = /^(?:padding|margin)(?:-(?:block|inline)(?:-(?:start|end))?)?$|^(?:row-|column-)?gap$/

const sizing = /^(?:min-|max-)?(?:inline|block)-size$/

const colors = /^(?:background-color|color|border-color|box-shadow|border(?:-(?:block|inline)-(?:start|end))?)$/

const property = /^--enchase-(.+?)-(padding(?:-(?:block|inline)(?:-(?:start|end))?)?|margin(?:-(?:block|inline)(?:-(?:start|end))?)?|gap|row-height|progress-opacity|min-width|min-height|max-width|max-height|width|height|background|color|border-color|shadow|row-background)(?:-[a-z-]+)?$/

const tokens = {
  ...fontVariables(baseTokens.fonts),
  ...layoutVariables(baseTokens),
  ...colorVariables(defaultTheme.light.colors),
  ...shadowVariables(defaultTheme.light.shadows)
}

const root = path.resolve(__dirname, '../../components')

const walk = (dir: string, extension: RegExp): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)

    return statSync(full).isDirectory() ? walk(full, extension) : extension.test(full) ? [full] : []
  })

const relative = (file: string) => path.relative(root, file).split(path.sep).join('/')

const declarationsOf = (css: string) => [...css.matchAll(/^\s*([a-z-]+):\s*([^;]+);/gm)].map(([, name, value]) => ({ property: name, value: value.trim() }))

const length = /\d(?:\.\d+)?(?:px|rem|em)\b/

const floors = /max\(24px, /g

const floor = (name: string, value: string) => name.startsWith('min-') && value === '24px'

describe('the space, the size, the colors and the shadows of the containers', () => {
  const files = walk(root, /\.module\.css$/)
    .map((file) => [relative(file), readFileSync(file, 'utf8')] as const)
    .filter(([name]) => scope.some((directory) => name.startsWith(`${directory}/`)))
  const uses = files.flatMap(([file, css]) => hookUses(css).filter((use) => !isToken(use.name) && !typography.test(use.name) && property.test(use.name)).map((use) => ({ file, ...use })))
  const slots = new Set(
    walk(root, /\.tsx$/).flatMap((file) => [...readFileSync(file, 'utf8').matchAll(/slot\('([a-z-]+)'(?:,\s*'([a-z-]+)')?\)/g)].map(([, component, part]) => (part ? `${component}-${part}` : component)))
  )

  it('reads every padding, margin, gap, size, color and shadow from a hook, and lists what is still fixed', () => {
    const bare = Object.fromEntries(
      files
        .map(([name, css]) => {
          const found = declarationsOf(css)
            .filter(({ property: prop, value }) => (spacing.test(prop) || sizing.test(prop) || colors.test(prop)) && !value.includes('color-mix(') && !floor(prop, value))
            .filter(({ property: prop, value }) => {
              const bareToken = /var\(--enchase-(?:color|shadow|space)-[a-z0-9-]+\)/.test(withoutHooks(value))
              const literal = (spacing.test(prop) || sizing.test(prop)) && length.test(withoutVariables(value).replace(floors, ''))

              return bareToken || literal
            })
            .map(({ property: prop, value }) => `${prop}: ${value}`)

          return [name, found] as const
        })
        .filter(([, list]) => list.length > 0)
    )

    expect(uses.length).toBeGreaterThan(80)
    expect(bare).toEqual(fixed)
  })

  it('falls back to a token of the theme that exists, or to a plain value', () => {
    const wrong = uses.filter(({ fallback }) => {
      const refs = [...fallback.matchAll(/var\((--enchase-[a-z0-9-]+)\)/g)].map((match) => match[1])

      return refs.some((ref) => tokens[ref] === undefined)
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

  it('shares one hook for the color of the underline of the selected tab and of the sliding indicator', () => {
    const css = files.find(([file]) => file.startsWith('common/Tabs/'))?.[1] ?? ''
    const indicator = hookUses(css).filter((use) => use.name === '--enchase-tabs-indicator-color')

    expect(indicator.length).toBe(2)
  })

  it('only reads the hooks, never declares them', () => {
    const declaring = files.filter(([, css]) => /^\s*--enchase-[a-z-]+-(?:padding|margin|gap|width|height|background|color|border-color|shadow)[a-z-]*:/m.test(css)).map(([name]) => name)

    expect(declaring).toEqual([])
  })
})
