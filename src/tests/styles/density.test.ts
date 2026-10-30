import { describe, expect, it } from 'vitest'
import path from 'node:path'

import { cssVariablesRule, defaultThemeCss, densityRules, fontVariablesRule, layoutVariables, layoutVariablesRule, themeCss } from '@styles/css/declarations.ts'
import { baseTokens, defaultTheme, densities } from '@styles/tokens/index.ts'
import { collectCssHooks, isToken } from '../../../scripts/cssHooks.mjs'
import { builtInStyleEntries } from '@tests/shared/fixtures/styles.ts'
import { createTheme } from '@styles/theme/createTheme.ts'
import { variableGroups } from '@styles/tokens/groups.ts'
import { defineStyle } from '@styles/theme/style.ts'

import type { ThemeStyle } from '@styles/theme/style.ts'
import type { ThemeSet } from '@styles/tokens/types.ts'

const tokensSelector = ":root[data-density='compact']"

const hooksSelector = `:where(${tokensSelector})`

const floor = 24

const largeFloor = 44

const components = path.resolve(__dirname, '../../components')

const pixels = (value: string) => (value.endsWith('rem') ? Number.parseFloat(value) * 16 : Number.parseFloat(value))

const indent = (css: string) => css.replace(/^(?=.)/gm, '  ')

const declarationOf = (text: string) => ({
  name: text.slice(0, text.indexOf(':')).trim(),
  value: text.slice(text.indexOf(':') + 1).trim()
})

const rulesOf = (css: string) =>
  [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({
    selector: selector.trim(),
    declarations: body
      .split(';')
      .filter((text) => text.trim() !== '')
      .map(declarationOf)
  }))

const blockOf = (css: string) => rulesOf(css).filter(({ selector }) => selector.includes('data-density'))

const declaredBy = (css: string, selector: string) =>
  blockOf(css)
    .filter((rule) => rule.selector === selector)
    .flatMap(({ declarations }) => declarations)

const specificity = (selector: string) => {
  const outside = selector.replace(/:where\((?:[^()]|\([^()]*\))*\)/g, '')
  const count = (pattern: RegExp) => (outside.match(pattern) ?? []).length

  return [
    count(/#[\w-]+/g),
    count(/\[[^\]]*\]|\.[\w-]+|:(?!:)[\w-]+/g),
    count(/::[\w-]+|(?:^|[\s>+~])[a-z][\w-]*/g)
  ]
}

const ruleOf = (selector: string, record: Record<string, string>) =>
  `${selector} {\n${Object.entries(record)
    .map(([name, value]) => `  ${name}: ${value};`)
    .join('\n')}\n}`

const withoutDensity = ({ base, light, dark, hooks }: ThemeSet) =>
  [
    fontVariablesRule(':root', base.fonts),
    layoutVariablesRule(':root', base, hooks),
    cssVariablesRule(":root, [data-theme='light']", light),
    cssVariablesRule("[data-theme='dark']", dark),
    `@media (prefers-color-scheme: dark) {\n${indent(cssVariablesRule(':root:not([data-theme])', dark))}\n}`
  ].join('\n\n')

const themes: Array<[string, ThemeSet]> = [
  ['the default theme', defaultTheme],
  ...builtInStyleEntries.map(([name, style]): [string, ThemeSet] => [`the ${name} style`, createTheme({ style })]),
  [
    'a theme with a brand, a shape and a font',
    createTheme({ brand: '#0B6BCB', shape: 'soft', fonts: { primary: 'Arial' } })
  ]
]

describe('the compact density in the css of the theme', () => {
  const css = themeCss(defaultTheme)
  const tokens = declaredBy(css, tokensSelector)
  const hooks = declaredBy(css, hooksSelector)
  const entries = (record: Record<string, string>) => Object.entries(record).map(([name, value]) => ({ name, value }))

  it('writes the tokens and then the hooks, right after the layout variables and before the colors', () => {
    expect(rulesOf(css).map(({ selector }) => selector)).toEqual([
      ':root',
      ':root',
      tokensSelector,
      hooksSelector,
      ":root, [data-theme='light']",
      "[data-theme='dark']",
      ':root:not([data-theme])'
    ])
    expect(css).toContain(`\n\n${densityRules('compact')}\n\n`)
  })

  it('writes what the data says, one declaration per entry and in the same order', () => {
    expect(tokens).toEqual(entries(densities.compact.tokens))
    expect(hooks).toEqual(entries(densities.compact.hooks))
    expect(tokens.length).toBeGreaterThan(0)
    expect(hooks.length).toBeGreaterThan(0)
  })

  it('starts every selector of the block with the root and the attribute, so the same attribute on any other element does nothing', () => {
    expect(blockOf(css)).toHaveLength(2)

    for (const { selector } of blockOf(css)) expect(selector).toMatch(/^(?::where\()?:root\[data-density=/)
  })

  it('matches the root element that has the attribute set to compact, and no other element, whatever the attribute says there', () => {
    const page = document.implementation.createHTMLDocument('')
    const inner = page.body.appendChild(page.createElement('div'))
    const elements = [page.documentElement, page.body, inner]
    const matched = () => blockOf(css).map(({ selector }) => elements.map((element) => element.matches(selector)))
    const nowhere = [
      [false, false, false],
      [false, false, false]
    ]
    const onRoot = [
      [true, false, false],
      [true, false, false]
    ]

    expect(matched()).toEqual(nowhere)

    for (const element of elements.slice(1)) {
      element.setAttribute('data-density', 'compact')
      expect(matched()).toEqual(nowhere)
    }

    page.documentElement.setAttribute('data-density', 'compact')
    expect(matched()).toEqual(onRoot)

    for (const value of ['default', 'spacious', '']) {
      page.documentElement.setAttribute('data-density', value)
      expect(matched()).toEqual(nowhere)
    }

    page.documentElement.removeAttribute('data-density')
    expect(matched()).toEqual(nowhere)
  })

  it('declares only css variables, never a property of an element', () => {
    const names = blockOf(css).flatMap(({ declarations }) => declarations.map(({ name }) => name))

    expect(names).toHaveLength(tokens.length + hooks.length)
    expect(names.filter((name) => !/^--enchase-[a-z0-9-]+$/.test(name))).toEqual([])
  })

  it('keeps the two sets apart: the tokens in the rule at 0,2,0, which beats the root of the theme, and the hooks in the rule at 0,0,0, which a hook of a style or of the app beats', () => {
    expect(specificity(':root')).toEqual([0, 1, 0])
    expect(specificity(tokensSelector)).toEqual([0, 2, 0])
    expect(specificity(hooksSelector)).toEqual([0, 0, 0])
    expect(tokens.filter(({ name }) => !isToken(name))).toEqual([])
    expect(hooks.filter(({ name }) => isToken(name))).toEqual([])
    expect(tokens.filter(({ name }) => hooks.some((hook) => hook.name === name))).toEqual([])
  })

  it('declares only tokens that baseTokens has and only hooks that the css of the components reads', () => {
    const known = layoutVariables(baseTokens)
    const read = new Set(collectCssHooks(components).map(({ name }) => name))

    expect(tokens.filter(({ name }) => known[name] === undefined)).toEqual([])
    expect(hooks.filter(({ name }) => !read.has(name))).toEqual([])
  })

  it('never goes above the value of a built-in style: the tokens against the enchase and the shadcn styles, the hooks against the fallback of the component', () => {
    const fallbacks = Object.fromEntries(collectCssHooks(components).map(({ name, fallback }) => [name, fallback]))

    for (const [style, definition] of builtInStyleEntries) {
      const variables = layoutVariables(createTheme({ style: definition }).base)

      for (const { name, value } of tokens) expect(pixels(value), `${name} against the ${style} style`).toBeLessThanOrEqual(pixels(variables[name] ?? ''))
    }

    for (const { name, value } of hooks) expect(pixels(value), `${name} against the fallback of the component`).toBeLessThanOrEqual(pixels(fallbacks[name] ?? ''))
  })

  it('keeps the targets at 24px or more, and the large target out of the block or at 44px or more', () => {
    const sized = tokens.filter(({ name }) => name === '--enchase-hit-size' || name.startsWith('--enchase-control-height-'))
    const large = tokens.filter(({ name }) => name === '--enchase-hit-size-lg')

    expect(sized.map(({ name }) => name)).toEqual([
      '--enchase-hit-size',
      '--enchase-control-height-sm',
      '--enchase-control-height-md',
      '--enchase-control-height-lg'
    ])
    expect(sized.filter(({ value }) => pixels(value) < floor)).toEqual([])
    expect(large.filter(({ value }) => pixels(value) < largeFloor)).toEqual([])
  })

  it('keeps the medium space at twice the small one, which keeps the floating label of the fields in line with the notch', () => {
    const space = (size: string) => pixels(tokens.find(({ name }) => name === `--enchase-space-${size}`)?.value ?? '')

    expect(space('sm')).toBeGreaterThan(0)
    expect(space('md')).toBe(2 * space('sm'))
  })

  it('declares tokens of the space, control and hit groups only, never typography nor radius', () => {
    const groups = variableGroups.filter((group) => tokens.some(({ name }) => name.startsWith(`--enchase-${group}-`)))

    expect(groups).toEqual(['space', 'control', 'hit'])
    expect(tokens.filter(({ name }) => /^--enchase-(?:font|line-height|letter-spacing|radius)-/.test(name))).toEqual([])
  })

  it('goes inside the same layer as the rest of the theme, whatever the name of the layer', () => {
    for (const layer of ['enchase-theme', 'app', 'design.system.theme']) {
      const layered = themeCss(defaultTheme, { layer })

      expect(layered).toBe(`@layer ${layer} {\n${indent(css)}\n}`)
      expect(blockOf(layered).map(({ selector }) => selector)).toEqual([tokensSelector, hooksSelector])
    }
  })

  it('is part of the static default theme', () => {
    expect(defaultThemeCss).toBe(css)
    expect(defaultThemeCss.split(densityRules('compact'))).toHaveLength(2)
  })

  it('is only css: createTheme takes no density, and the theme set of a style that has none carries none', () => {
    expect(() => createTheme({ density: 'compact' } as never)).toThrow('Unknown theme mode "density"')
    expect(Object.keys(createTheme())).toEqual(['base', 'light', 'dark'])
    expect(themes.filter(([, theme]) => JSON.stringify(theme).includes('density'))).toEqual([])
  })

  describe.each(themes)('in the css of %s', (_, theme) => {
    it('is written once, the same for every theme', () => {
      expect(themeCss(theme).split(densityRules('compact'))).toHaveLength(2)
      expect(blockOf(themeCss(theme))).toEqual(blockOf(css))
    })

    it('leaves everything else as the theme wrote it before the density, with and without a layer', () => {
      expect(themeCss(theme).replace(`${densityRules('compact')}\n\n`, '')).toBe(withoutDensity(theme))
      expect(themeCss(theme, { layer: 'app' }).replace(`${indent(densityRules('compact'))}\n\n`, '')).toBe(`@layer app {\n${indent(withoutDensity(theme))}\n}`)
    })
  })
})

describe('the compact density that a style carries, in the css of the theme', () => {
  const dense = defineStyle({
    hooks: { '--enchase-input-height': '2.25rem', '--enchase-navbar-bar-height': '3rem' },
    density: {
      compact: {
        tokens: { '--enchase-hit-size': '24px', '--enchase-space-md': '0.5rem', '--enchase-font-size-base': '0.9375rem', '--enchase-line-height-normal': 1.4 },
        hooks: { '--enchase-input-height': '2rem', '--enchase-tabs-tab-min-height': '1.75rem' }
      }
    }
  })
  const theme = createTheme({ style: dense })
  const css = themeCss(theme)
  const tokens = declaredBy(css, tokensSelector)
  const hooks = declaredBy(css, hooksSelector)
  const said = ['--enchase-hit-size', '--enchase-space-md']
  const redeclared = ['--enchase-input-height', '--enchase-tabs-tab-min-height']
  const without = (record: Record<string, string>, names: string[]) => Object.fromEntries(Object.entries(record).filter(([name]) => !names.includes(name)))
  const entries = (record: Record<string, string>) => Object.entries(record).map(([name, value]) => ({ name, value }))
  const merged = {
    ...densities.compact.tokens,
    '--enchase-hit-size': '24px',
    '--enchase-space-md': '0.5rem',
    '--enchase-font-size-base': '0.9375rem',
    '--enchase-line-height-normal': '1.4',
    '--enchase-input-height': '2rem',
    '--enchase-tabs-tab-min-height': '1.75rem'
  }
  const kept = without(densities.compact.hooks, redeclared)
  const written = (style: ThemeStyle) => densityRules('compact', createTheme({ style: defineStyle(style) }).density?.compact)

  it('writes the block of the default theme, rule by rule, from the data, when it is given no density of a style', () => {
    const block = [ruleOf(tokensSelector, densities.compact.tokens), ruleOf(hooksSelector, densities.compact.hooks)].join('\n\n')

    expect(densityRules('compact')).toBe(block)
    expect(densityRules('compact', undefined)).toBe(block)
    expect(densityRules('compact', {})).toBe(block)
    expect(densityRules('compact', { tokens: {}, hooks: {} })).toBe(block)
  })

  it.each([
    ['no density', {}],
    ['an empty density', { density: {} }],
    ['an empty compact density', { density: { compact: {} } }],
    ['empty tokens and hooks', { density: { compact: { tokens: {}, hooks: {} } } }]
  ])('writes the same block and the same theme as without a style for a style with %s', (_, style) => {
    expect(written(style)).toBe(densityRules('compact'))
    expect(themeCss(createTheme({ style: defineStyle(style) }))).toBe(themeCss(defaultTheme))
  })

  it('writes the tokens of the style over the tokens of the default, key by key, then its own tokens and its hooks, all in one rule', () => {
    expect(tokens).toEqual(entries(merged))
    expect(tokens.slice(0, 10).map(({ name }) => name)).toEqual(Object.keys(densities.compact.tokens))
    expect(tokens.slice(10).map(({ name }) => name)).toEqual(['--enchase-font-size-base', '--enchase-line-height-normal', '--enchase-input-height', '--enchase-tabs-tab-min-height'])
    expect(densityRules('compact', theme.density?.compact)).toBe([ruleOf(tokensSelector, merged), ruleOf(hooksSelector, kept)].join('\n\n'))
  })

  it('keeps the value of the default for a token that the style does not say, and writes a line height as the number it is', () => {
    for (const [name, value] of Object.entries(without(densities.compact.tokens, said))) expect(tokens.find((token) => token.name === name)?.value, name).toBe(value)

    expect(tokens.find(({ name }) => name === '--enchase-line-height-normal')?.value).toBe('1.4')
  })

  it('writes in the rule at 0,0,0 only the hooks of the default that the style does not redeclare, and no variable twice', () => {
    const names = blockOf(css).flatMap(({ declarations }) => declarations.map(({ name }) => name))

    expect(hooks).toEqual(entries(kept))
    expect(hooks.map(({ name }) => name).filter((name) => redeclared.includes(name))).toEqual([])
    expect(hooks).toHaveLength(Object.keys(densities.compact.hooks).length - redeclared.length)
    expect(new Set(names).size).toBe(names.length)
  })

  it('writes the hooks of the style at 0,2,0, which beats the 0,1,0 of the hooks that the style declares on the root, and leaves the hooks of the default at 0,0,0', () => {
    const rootHooks = rulesOf(css)
      .filter(({ selector }) => selector === ':root')
      .flatMap(({ declarations }) => declarations)

    expect(rootHooks).toEqual(expect.arrayContaining(entries({ '--enchase-input-height': '2.25rem', '--enchase-navbar-bar-height': '3rem' })))
    expect(specificity(':root')).toEqual([0, 1, 0])
    expect(blockOf(css).map(({ selector }) => selector)).toEqual([tokensSelector, hooksSelector])
    expect(blockOf(css).map(({ selector }) => specificity(selector))).toEqual([
      [0, 2, 0],
      [0, 0, 0]
    ])
    expect(tokens.filter(({ name }) => redeclared.includes(name))).toEqual(entries({ '--enchase-input-height': '2rem', '--enchase-tabs-tab-min-height': '1.75rem' }))
  })

  it('writes the block in the same place, after the layout variables and before the colors, and leaves the rest of the css as it was', () => {
    expect(tokens).toContainEqual({ name: '--enchase-hit-size', value: '24px' })
    expect(rulesOf(css).map(({ selector }) => selector)).toEqual([':root', ':root', tokensSelector, hooksSelector, ":root, [data-theme='light']", "[data-theme='dark']", ':root:not([data-theme])'])
    expect(css.replace(`${densityRules('compact', theme.density?.compact)}\n\n`, '')).toBe(withoutDensity(theme))
  })

  it('starts every selector of the block with the root and the attribute, and declares only css variables', () => {
    const names = blockOf(css).flatMap(({ declarations }) => declarations.map(({ name }) => name))

    for (const { selector } of blockOf(css)) expect(selector).toMatch(/^(?::where\()?:root\[data-density=/)

    expect(names).toContain('--enchase-line-height-normal')
    expect(names).toHaveLength(tokens.length + hooks.length)
    expect(names.filter((name) => !/^--enchase-[a-z0-9-]+$/.test(name))).toEqual([])
  })

  it('goes inside the same layer as the rest of the theme', () => {
    const layered = themeCss(theme, { layer: 'app' })

    expect(layered).toBe(`@layer app {\n${indent(css)}\n}`)
    expect(blockOf(layered).map(({ selector }) => selector)).toEqual([tokensSelector, hooksSelector])
    expect(declaredBy(layered, tokensSelector)).toContainEqual({ name: '--enchase-hit-size', value: '24px' })
    expect(declaredBy(layered, tokensSelector)).toEqual(tokens)
    expect(declaredBy(layered, hooksSelector)).toEqual(hooks)
  })

  it('writes the same block with a brand, a shape and fonts, which have nothing to do with the density', () => {
    const other = createTheme({ style: dense, brand: '#0B6BCB', shape: 'soft', fonts: { primary: 'Arial' } })

    expect(declaredBy(themeCss(other), tokensSelector)).toContainEqual({ name: '--enchase-hit-size', value: '24px' })
    expect(blockOf(themeCss(other))).toEqual(blockOf(css))
  })

  it('writes only the hooks of the style next to the tokens of the default when the style has no tokens', () => {
    const block = written({ density: { compact: { hooks: { '--enchase-input-height': '2rem' } } } })
    const unsaid = without(densities.compact.hooks, ['--enchase-input-height'])

    expect(block).toBe([ruleOf(tokensSelector, { ...densities.compact.tokens, '--enchase-input-height': '2rem' }), ruleOf(hooksSelector, unsaid)].join('\n\n'))
  })

  it('writes the tokens of the style next to all the hooks of the default when the style has no hooks', () => {
    const block = written({ density: { compact: { tokens: { '--enchase-space-sm': '0.25rem', '--enchase-space-md': '0.5rem' } } } })

    expect(block).toBe([ruleOf(tokensSelector, { ...densities.compact.tokens, '--enchase-space-sm': '0.25rem', '--enchase-space-md': '0.5rem' }), ruleOf(hooksSelector, densities.compact.hooks)].join('\n\n'))
  })

  it('leaves the rule at 0,0,0 out when the style redeclares every hook of the default, instead of writing a rule with nothing in it', () => {
    const every = Object.fromEntries(Object.keys(densities.compact.hooks).map((name) => [name, '1rem']))
    const block = written({ density: { compact: { hooks: every } } })

    expect(block).toBe(ruleOf(tokensSelector, { ...densities.compact.tokens, ...every }))
    expect(blockOf(block).map(({ selector }) => selector)).toEqual([tokensSelector])
    expect(block).not.toContain(':where(')
  })

  it('writes a token that is undefined as if it was not there, so the token of the default stays', () => {
    const block = written({ density: { compact: { tokens: { '--enchase-space-md': undefined, '--enchase-hit-size': '24px' } } } } as ThemeStyle)

    expect(block).toBe([ruleOf(tokensSelector, { ...densities.compact.tokens, '--enchase-hit-size': '24px' }), ruleOf(hooksSelector, densities.compact.hooks)].join('\n\n'))
    expect(block).not.toContain('undefined')
  })
})
