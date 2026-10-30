import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { followedHooks, hookRows, keptHooks, tokenRows } from '@docs/stories/system/Density/defaultData.ts'
import { collectCssHooks } from '../../../../../../scripts/cssHooks.mjs'
import { builtInStyles } from '@tests/shared/fixtures/styles.ts'
import { layoutVariables } from '@styles/css/declarations.ts'
import { createTheme } from '@styles/theme/createTheme.ts'
import { densities } from '@styles/tokens/index.ts'

import type { ThemeSet } from '@styles/tokens/types.ts'

const components = path.resolve(__dirname, '../../../../../components')

const guide = readFileSync(path.resolve(__dirname, '../../../../../../README.pt-BR.md'), 'utf8')

const compactTokens: Record<string, string> = densities.compact.tokens

const compactHooks: Record<string, string> = densities.compact.hooks

const enchase = createTheme({ style: builtInStyles.enchase })

const shadcn = createTheme({ style: builtInStyles.shadcn })

const enchaseVariables = layoutVariables(enchase.base)

const shadcnVariables = layoutVariables(shadcn.base)

const fallbacks = Object.fromEntries(collectCssHooks(components).map(({ name, fallback }) => [name, fallback]))

const declaredBy = (theme: ThemeSet, name: string) => {
  const hooks: Record<string, string> = { ...theme.hooks }

  return hooks[name]
}

const aliasOf = (value: string) => /^var\((--[a-z0-9-]+)\)$/.exec(value)?.[1]

const resolved = (value: string, variables: Record<string, string>) => value.replace(/var\((--[a-z0-9-]+)\)/g, (_, name: string) => variables[name] ?? '')

const guideRows = () =>
  guide
    .slice(guide.indexOf('## Densidade'), guide.indexOf('## Renderização no servidor'))
    .split('\n')
    .filter((line) => line.startsWith('| `--enchase-'))
    .map((line) =>
      line
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim().replace(/`/g, ''))
    )

const followsDensity = (declared: string | undefined) => {
  if (declared === undefined) return true

  const alias = aliasOf(declared)

  return alias !== undefined && alias in compactTokens
}

describe('the density tables of the docs', () => {
  it('list the tokens of the compact density, in the order of the block, with the compact values', () => {
    expect(tokenRows.map(({ name }) => name)).toEqual(Object.keys(compactTokens))
    expect(tokenRows.map(({ compact }) => compact)).toEqual(Object.values(compactTokens))
  })

  it('list the hooks of the compact density, in the order of the block, with the compact values', () => {
    expect(hookRows.map(({ name }) => name)).toEqual(Object.keys(compactHooks))
    expect(hookRows.map(({ compact }) => compact)).toEqual(Object.values(compactHooks))
  })

  it('write the default of the enchase style: the value of the token, and for a hook the default that the component writes, because the style declares none of them', () => {
    expect(tokenRows.map(({ enchase: value }) => value)).toEqual(tokenRows.map(({ name }) => enchaseVariables[name]))
    expect(hookRows.map(({ name }) => declaredBy(enchase, name))).toEqual(hookRows.map(() => undefined))
    expect(hookRows.map(({ enchase: value }) => value)).toEqual(hookRows.map(({ name }) => fallbacks[name]))
  })

  it('write the shadcn style as it is: the value of the token, and the hook as the style declares it, which it does for every hook of the block', () => {
    expect(tokenRows.map(({ shadcn: value }) => value)).toEqual(tokenRows.map(({ name }) => shadcnVariables[name]))
    expect(hookRows.map(({ shadcn: value }) => value)).toEqual(hookRows.map(({ name }) => declaredBy(shadcn, name)))
  })

  it('write what the shadcn style gets in compact: its hook with the tokens of the block applied, which beat the tokens of the style', () => {
    const variables = { ...shadcnVariables, ...compactTokens }

    expect(hookRows.map(({ shadcnCompact }) => shadcnCompact)).toEqual(hookRows.map(({ name }) => resolved(declaredBy(shadcn, name) ?? compactHooks[name], variables)))
  })

  it('say that the shadcn style follows exactly the hooks that it declares as an alias of a token of the block', () => {
    expect(hookRows.map(({ follows }) => follows)).toEqual(hookRows.map(({ name }) => followsDensity(declaredBy(shadcn, name))))
    expect(followedHooks.length).toBeGreaterThan(0)
    expect(keptHooks.length).toBeGreaterThan(0)
  })

  it('split the hooks into the ones that the shadcn style follows and the ones that it keeps, with none left out and none twice', () => {
    expect([...followedHooks, ...keptHooks].map(({ name }) => name).sort()).toEqual(hookRows.map(({ name }) => name).sort())
    expect(followedHooks.filter(({ follows }) => !follows)).toEqual([])
    expect(keptHooks.filter(({ follows }) => follows)).toEqual([])
  })

  it('are the same in the guide in Portuguese, which is written by hand: the same tokens and hooks, with the same values and the same hooks followed by the shadcn style', () => {
    const rows = guideRows()

    expect(rows.filter((cells) => cells.length === 4)).toEqual(tokenRows.map(({ name, enchase: value, shadcn: other, compact }) => [name, value, other, compact]))
    expect(rows.filter((cells) => cells.length === 6)).toEqual(hookRows.map(({ name, enchase: value, compact, shadcn: other, shadcnCompact, follows }) => [name, value, compact, other, shadcnCompact, follows ? 'sim' : 'não']))
  })
})
