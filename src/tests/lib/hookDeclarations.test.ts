import { describe, expect, it } from 'vitest'

import { deprecationGaps, exportsOf, wrapperOf } from '../../../scripts/hookDeclarations.mjs'

const headless = "export { useTabs } from '../../src/components/common/Tabs/useTabs.js';\nexport type { UseTabsOptions, UseTabsReturn } from '../../src/components/common/Tabs/types.js';\n"

describe('the declarations of the hook entries', () => {
  it('reads the values and the types that a headless declaration exports', () => {
    expect(exportsOf(headless)).toEqual({ values: ['useTabs'], types: ['UseTabsOptions', 'UseTabsReturn'] })
  })

  it('reads the exported name of a renamed export, and several statements of each kind', () => {
    const text = "export { first as useFirst } from './a.js';\nexport { second } from './b.js';\nexport type { One } from './a.js';\nexport type { Two as Other } from './b.js';\n"

    expect(exportsOf(text)).toEqual({ values: ['useFirst', 'second'], types: ['One', 'Other'] })
  })

  it('refuses an export that is neither a value nor a type re-exported from another file', () => {
    expect(() => exportsOf(`${headless}export declare const extra: number;\n`)).toThrow('export declare const extra: number;')
    expect(() => exportsOf(`${headless}export * from './more.js';\n`)).toThrow('export * from')
    expect(() => exportsOf(`${headless}export default function useThing(): void;\n`)).toThrow('export default')
  })

  it('writes one wrapper for each export, with the tag that points to the new entry', () => {
    expect(wrapperOf('tabs', exportsOf(headless))).toBe(
      [
        "import * as headless from '../headless/tabs.js'",
        '',
        "/** @deprecated Import it from 'enchase/headless/tabs'. */",
        'export declare const useTabs: typeof headless.useTabs',
        '',
        "/** @deprecated Import it from 'enchase/headless/tabs'. */",
        'export type UseTabsOptions = headless.UseTabsOptions',
        '',
        "/** @deprecated Import it from 'enchase/headless/tabs'. */",
        'export type UseTabsReturn = headless.UseTabsReturn',
        ''
      ].join('\n')
    )
  })

  it('finds no gap when every export of the old entry is a tagged wrapper of an export of the new one', () => {
    expect(deprecationGaps(headless, wrapperOf('tabs', exportsOf(headless)))).toEqual([])
  })

  it('names the exports that lost their tag, that the old entry lacks or that it has beyond the new one', () => {
    const wrapper = wrapperOf('tabs', exportsOf(headless))

    expect(deprecationGaps(headless, wrapper.replace("/** @deprecated Import it from 'enchase/headless/tabs'. */\nexport declare const useTabs", 'export declare const useTabs'))).toEqual(['useTabs is exported without @deprecated, or not exported'])
    expect(deprecationGaps(headless, wrapper.replace(/\/\*\* @deprecated[^\n]*\n(export type UseTabsReturn[^\n]*\n)/, ''))).toEqual(['UseTabsReturn is exported without @deprecated, or not exported'])
    expect(deprecationGaps(headless, `${wrapper}\n/** @deprecated Import it from 'enchase/headless/tabs'. */\nexport type Extra = headless.UseTabsOptions\n`)).toEqual(['Extra is exported by the old entry and not by the new one'])
    expect(deprecationGaps(headless, `${wrapper}export * from '../headless/tabs.js'\n`)).toEqual(['the old entry has an export that is not a deprecated wrapper: export * from \'../headless/tabs.js\''])
  })
})
