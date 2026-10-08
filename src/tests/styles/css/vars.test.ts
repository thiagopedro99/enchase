import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { colorVariables, fontVariables, layoutVariables, shadowVariables } from '@styles/css/declarations.ts'
import { globalStylesCss } from '@styles/css/global.ts'
import { vars } from '@styles/css/vars.ts'
import { defaultTheme } from '@styles/tokens/index.ts'

const leaves = (tree: unknown): string[] => (typeof tree === 'object' && tree !== null ? Object.values(tree).flatMap(leaves) : [String(tree)])

const nameOf = (reference: string) => reference.replace(/^var\((.*)\)$/, '$1')

const declared = new Set([
  ...Object.keys(colorVariables(defaultTheme.light.colors)),
  ...Object.keys(shadowVariables(defaultTheme.light.shadows)),
  ...Object.keys(fontVariables(defaultTheme.base.fonts)),
  ...Object.keys(layoutVariables(defaultTheme.base))
])

const usedIn = (text: string) => [...text.matchAll(/var\((--enchase-[a-z0-9-]+)\)/g)].map((match) => match[1])

const filesUnder = (dir: string, extension: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)

    return statSync(full).isDirectory() ? filesUnder(full, extension) : full.endsWith(extension) ? [full] : []
  })

describe('vars', () => {
  it('has the shape of the tokens and points to css variables', () => {
    expect(vars.color.text.primary).toBe('var(--enchase-color-text-primary)')
    expect(vars.color.onPrimaryContainer).toBe('var(--enchase-color-on-primary-container)')
    expect(vars.shadow.md).toBe('var(--enchase-shadow-md)')
    expect(vars.font.primary).toBe('var(--enchase-font-primary)')
    expect(vars.font.mono).toBe('var(--enchase-font-mono)')
    expect(vars.font.size['2xl']).toBe('var(--enchase-font-size-2xl)')
    expect(vars.font.weight.semibold).toBe('var(--enchase-font-weight-semibold)')
    expect(vars.space.lg).toBe('var(--enchase-space-lg)')
    expect(vars.radius.full).toBe('var(--enchase-radius-full)')
    expect(vars.transition.normal).toBe('var(--enchase-transition-normal)')
    expect(vars.state.hover).toBe('var(--enchase-state-hover)')
    expect(vars.z.modal).toBe('var(--enchase-z-modal)')
  })

  it('has exactly one entry for every variable the theme declares', () => {
    const names = leaves(vars).map(nameOf)

    expect(new Set(names).size).toBe(names.length)
    expect(new Set(names)).toEqual(declared)
  })
})

describe('the variables the css uses', () => {
  it('are all declared by the theme in the global styles', () => {
    for (const name of usedIn(globalStylesCss)) expect(declared.has(name), name).toBe(true)
  })

  it('are all declared by the theme in every css module', () => {
    const files = filesUnder('src', '.module.css')

    expect(files.length).toBeGreaterThan(0)

    for (const file of files) {
      for (const name of usedIn(readFileSync(file, 'utf8'))) expect(declared.has(name), `${file}: ${name}`).toBe(true)
    }
  })
})
