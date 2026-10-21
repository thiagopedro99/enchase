import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { collectCssHooks, cssHooksModel, ownerOf, resolveToken } from '../../../scripts/cssHooks.mjs'

const made: string[] = []

const components = (files: Record<string, string>) => {
  const root = mkdtempSync(path.join(tmpdir(), 'enchase-hooks-'))

  made.push(root)

  for (const [name, css] of Object.entries(files)) {
    mkdirSync(path.join(root, path.dirname(name)), { recursive: true })
    writeFileSync(path.join(root, name), css)
  }

  return root
}

afterEach(() => {
  for (const root of made.splice(0)) rmSync(root, { recursive: true, force: true })
})

const tokens = { '--enchase-radius-md': '0.75rem', '--enchase-radius-button': 'var(--enchase-radius-full)', '--enchase-radius-full': '9999px', '--enchase-line-height-normal': '1.5' }

describe('collectCssHooks', () => {
  it('finds a hook with a fallback in a declaration and skips the tokens of the theme', () => {
    const root = components({
      'Alert/styles.module.css': '.alert {\n  border-radius: var(--enchase-alert-radius, var(--enchase-radius-md));\n  color: var(--enchase-color-text-primary, red);\n  gap: var(--enchase-space-sm);\n}\n'
    })

    expect(collectCssHooks(root)).toEqual([{ name: '--enchase-alert-radius', fallback: 'var(--enchase-radius-md)', properties: ['border-radius'], components: ['Alert'] }])
  })

  it('keeps the whole fallback of a hook that holds a calc, and finds the hook inside another fallback', () => {
    const root = components({
      'RadioGroup/styles.module.css': '.control {\n  --radio-dot-size: var(--enchase-radio-group-control-dot-size, calc(var(--enchase-radio-group-control-size, 1.25rem) / 2));\n}\n'
    })
    const found = Object.fromEntries(collectCssHooks(root).map((hook) => [hook.name, hook.fallback]))

    expect(found['--enchase-radio-group-control-dot-size']).toBe('calc(var(--enchase-radio-group-control-size, 1.25rem) / 2)')
    expect(found['--enchase-radio-group-control-size']).toBe('1.25rem')
  })

  it('collects every property and every component a shared hook is used in', () => {
    const root = components({
      'Input/styles.module.css': '.input {\n  padding-inline: var(--enchase-input-padding-inline, var(--enchase-space-md));\n}\n.label {\n  inset-inline-start: var(--enchase-input-padding-inline, var(--enchase-space-md));\n}\n',
      'Textarea/styles.module.css': '.textarea {\n  padding-inline: var(--enchase-input-padding-inline, var(--enchase-space-md));\n}\n'
    })

    expect(collectCssHooks(root)).toEqual([{ name: '--enchase-input-padding-inline', fallback: 'var(--enchase-space-md)', properties: ['padding-inline', 'inset-inline-start'], components: ['Input', 'Textarea'] }])
  })

  it('reads a declaration that spans several lines', () => {
    const root = components({ 'Button/styles.module.css': '.button {\n  transition:\n    transform var(--enchase-button-duration, 150ms) ease,\n    color var(--enchase-button-duration, 150ms) ease;\n}\n' })

    expect(collectCssHooks(root).map((hook) => hook.name)).toEqual(['--enchase-button-duration'])
  })
})

describe('ownerOf', () => {
  it('gives a shared hook to the component its name starts with', () => {
    expect(ownerOf({ name: '--enchase-input-padding-inline', components: ['NumberInput', 'Input', 'Select'] })).toBe('Input')
    expect(ownerOf({ name: '--enchase-number-input-field-radius', components: ['NumberInput'] })).toBe('NumberInput')
  })

  it('falls back to the first component when the name starts with a slot that is not the component', () => {
    expect(ownerOf({ name: '--enchase-layout-header-menu-button-radius', components: ['AppBar'] })).toBe('AppBar')
  })
})

describe('resolveToken', () => {
  it('follows a token through the tokens that point to other tokens', () => {
    expect(resolveToken('var(--enchase-radius-button)', tokens)).toBe('9999px')
    expect(resolveToken('var(--enchase-radius-md)', tokens)).toBe('0.75rem')
  })

  it('uses the default written in the fallback when the theme does not have the token', () => {
    expect(resolveToken('var(--enchase-line-height-tight, 1.2)', tokens)).toBe('1.2')
    expect(resolveToken('var(--enchase-line-height-normal, 9)', tokens)).toBe('1.5')
  })

  it('has nothing to say about a plain value', () => {
    expect(resolveToken('18px', tokens)).toBeUndefined()
  })
})

describe('cssHooksModel', () => {
  it('groups the hooks by component, sorted, with the value the default token resolves to', () => {
    const root = components({
      'Badge/styles.module.css': '.badge {\n  border-radius: var(--enchase-badge-radius, var(--enchase-radius-button));\n  line-height: var(--enchase-badge-line-height, var(--enchase-line-height-normal, 1.5));\n}\n',
      'Alert/styles.module.css': '.alert {\n  border-radius: var(--enchase-alert-radius, var(--enchase-radius-md));\n}\n'
    })

    expect(cssHooksModel(root, tokens)).toEqual([
      { component: 'Alert', hooks: [{ name: '--enchase-alert-radius', owner: 'Alert', default: '0.75rem', token: '--enchase-radius-md', properties: ['border-radius'], components: ['Alert'] }] },
      {
        component: 'Badge',
        hooks: [
          { name: '--enchase-badge-line-height', owner: 'Badge', default: '1.5', token: '--enchase-line-height-normal', properties: ['line-height'], components: ['Badge'] },
          { name: '--enchase-badge-radius', owner: 'Badge', default: '9999px', token: '--enchase-radius-button', properties: ['border-radius'], components: ['Badge'] }
        ]
      }
    ])
  })

  it('keeps a plain default as it is, with no token', () => {
    const root = components({ 'Checkbox/styles.module.css': '.box {\n  inline-size: var(--enchase-checkbox-box-size, 18px);\n}\n' })

    expect(cssHooksModel(root, tokens)[0].hooks[0]).toMatchObject({ default: '18px', token: undefined })
  })
})
