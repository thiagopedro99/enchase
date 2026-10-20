import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { baseTokens } from '@styles/tokens/index.ts'

const root = path.resolve(__dirname, '../../components')

const cssFiles = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)

    return statSync(full).isDirectory() ? cssFiles(full) : full.endsWith('.module.css') ? [full] : []
  })

const relative = (file: string) => path.relative(root, file).split(path.sep).join('/')

const widthsOf = (css: string) => [...css.matchAll(/\(\s*(?:min|max)-width:\s*([\d.]+px)\s*\)/g)].map((match) => match[1])

describe('breakpoints written in the stylesheets', () => {
  it('only use the values of the breakpoint tokens, since a media query cannot read a variable', () => {
    const allowed = new Set(Object.values(baseTokens.breakpoints))
    const unknown = cssFiles(root).flatMap((file) =>
      widthsOf(readFileSync(file, 'utf8'))
        .filter((width) => !allowed.has(width))
        .map((width) => `${relative(file)}: ${width}`)
    )

    expect(unknown).toEqual([])
  })

  it('give the Grid one rule per breakpoint, from the smallest to the biggest, each one reading its own variable', () => {
    const css = readFileSync(path.join(root, 'common/Grid/styles.module.css'), 'utf8')
    const rules = [...css.matchAll(/@media \(min-width: ([\d.]+px)\) \{\s*:where\(\.grid\[data-responsive\]\) \{\s*--enchase-grid-n: var\(--enchase-grid-n-(\w+), 1\);/g)].map((match) => [match[2], match[1]])
    const { breakpoints } = baseTokens

    expect(rules).toEqual([
      ['sm', breakpoints.sm],
      ['md', breakpoints.md],
      ['lg', breakpoints.lg],
      ['xl', breakpoints.xl],
      ['xxl', breakpoints.xxl]
    ])
  })
})
