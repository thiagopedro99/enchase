import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { bandCandidates } from '../../../scripts/cascadeBands.mjs'

const componentsDir = path.resolve(__dirname, '../../components')

const made: string[] = []

const moduleWith = (css: string) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'enchase-bands-'))

  made.push(dir)
  mkdirSync(path.join(dir, 'Item'))
  writeFileSync(path.join(dir, 'Item', 'styles.module.css'), css)

  return dir
}

afterEach(() => {
  made.splice(0).forEach((dir) => rmSync(dir, { recursive: true, force: true }))
})

describe('the bands of the library on the ladder', () => {
  it('has no base rule that wins over a state rule without the state said in it', () => {
    expect(bandCandidates(componentsDir), 'esta regra de base vencia esta de estado; diga o estado nela').toEqual([])
  })

  it('finds a base rule that wins over a state rule of the same element and property', () => {
    const dir = moduleWith('.item:hover { color: blue; }\n.item[aria-current] { color: red; }\n')

    expect(bandCandidates(dir)).toEqual([{ module: path.join('Item', 'styles.module.css'), base: '.item[aria-current]', state: '.item:hover', tie: true, shared: ['color'] }])
  })

  it('accepts the same pair once the base rule names the state, with the same value', () => {
    const dir = moduleWith('.item:hover { color: blue; }\n.item[aria-current], .item[aria-current]:hover { color: red; }\n')

    expect(bandCandidates(dir)).toEqual([])
  })
})
