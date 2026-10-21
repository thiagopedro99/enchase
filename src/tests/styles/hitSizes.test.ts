import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { layoutVariables } from '@styles/css/declarations.ts'
import { baseTokens } from '@styles/tokens/index.ts'

const floor = 24

const use = /(max\(24px, )?var\((--enchase-hit-size(?:-lg)?), ([^)]*)\)/g

const defaults = layoutVariables(baseTokens)

const root = path.resolve(__dirname, '../../components')

const cssFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)

    return statSync(full).isDirectory() ? cssFiles(full) : full.endsWith('.module.css') ? [full] : []
  })

const relative = (file: string) => path.relative(root, file).split(path.sep).join('/')

const sizes = (css: string) => [...css.matchAll(/^\s*((?:min-|max-)?(?:inline|block)-size):\s*([^;]+);/gm)].map(([, property, value]) => ({ property, value }))

describe('the target sizes of the components', () => {
  const files = cssFiles(root).map((file) => [relative(file), readFileSync(file, 'utf8')] as const)
  const hits = files.flatMap(([name, css]) => [...css.matchAll(use)].map(([, guarded, token, fallback]) => ({ name, floor: guarded !== undefined, token, fallback })))

  it('reads every 40px and 44px target from the hit tokens, and lists the sizes that are still written in the component', () => {
    const literal = Object.fromEntries(
      files
        .map(([name, css]) => [name, sizes(css).filter(({ value }) => /^(?:40|44)px$/.test(value)).map(({ property, value }) => `${property}: ${value}`)] as const)
        .filter(([, list]) => list.length > 0)
    )

    expect(literal).toEqual({})
  })

  it('keeps the 24px floor inside every use of a hit token, with the default of the token as fallback, also where the room of a button is worked out from it', () => {
    expect(hits.length).toBeGreaterThan(0)
    expect(hits.filter(({ floor }) => !floor)).toEqual([])
    expect(hits.filter(({ token, fallback }) => fallback !== defaults[token])).toEqual([])
  })

  it('uses the regular target for the controls of a form and the large one for the buttons that open or close a navigation', () => {
    const large = hits.filter(({ token }) => token === '--enchase-hit-size-lg').map(({ name }) => name)

    expect([...new Set(large)].sort()).toEqual([
      'common/Sidebar/styles.module.css',
      'common/ThemeToggle/styles.module.css',
      'layout/subcomponentes/AppBar/styles.module.css',
      'layout/subcomponentes/SidebarUser/styles.module.css',
      'navbar/styles.module.css'
    ])
  })

  it('declares default targets that already respect the floor', () => {
    expect(Number.parseInt(defaults['--enchase-hit-size'], 10)).toBeGreaterThanOrEqual(floor)
    expect(Number.parseInt(defaults['--enchase-hit-size-lg'], 10)).toBeGreaterThanOrEqual(Number.parseInt(defaults['--enchase-hit-size'], 10))
  })

  it('only reads the hit tokens, never declares them', () => {
    const declaring = files.filter(([, css]) => /^\s*--enchase-hit-/m.test(css)).map(([name]) => name)

    expect(declaring).toEqual([])
  })
})
