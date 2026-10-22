import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { builtInStyles } from '@tests/shared/fixtures/styles.ts'

const root = path.resolve(__dirname, '../../..')

const sourcesIn = (directory: string): string[] =>
  readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const relative = path.posix.join(directory, entry.name)

    if (entry.isDirectory()) return sourcesIn(relative)

    return /\.(ts|tsx)$/.test(entry.name) ? [relative] : []
  })

const read = (file: string) => readFileSync(path.join(root, file), 'utf8')

const specifiersOf = (file: string) => [...read(file).matchAll(/(?:\bfrom|\bimport)\s*\(?\s*['"]([^'"]+)['"]/g)].map((match) => match[1] as string)

const reachesPresets = (specifier: string) => /(?:^|\/)presets(?:\/|$)/.test(specifier)

const presetFiles = sourcesIn('src/styles/presets').map((file) => path.posix.basename(file, '.ts'))

const mayImportPresets = (file: string) => file.startsWith('src/styles/presets/') || file === 'lib/styles.ts' || file.startsWith('src/tests/') || file.startsWith('src/tests-browser/')

describe('the styles are an entry of their own', () => {
  it('is imported only by the styles entry and by the tests', () => {
    const importers = [...sourcesIn('src'), ...sourcesIn('lib'), ...sourcesIn('demo')].filter((file) => specifiersOf(file).some(reachesPresets))

    expect(importers.filter((file) => !mayImportPresets(file))).toEqual([])
    expect(importers).toContain('lib/styles.ts')
  })

  it('keeps every other public entry free of the styles', () => {
    for (const entry of sourcesIn('lib').filter((file) => file !== 'lib/styles.ts')) {
      expect(specifiersOf(entry).filter(reachesPresets), entry).toEqual([])
    }
  })

  it('keeps each style as data, which imports only defineStyle and the types it is made of', () => {
    for (const file of sourcesIn('src/styles/presets')) {
      expect(specifiersOf(file).filter((specifier) => !['../theme/style.ts', '../tokens/types.ts'].includes(specifier)), file).toEqual([])
    }
  })

  it('exports one style for each file of the styles folder, under the name of the file, and no more', () => {
    const exported = [...read('lib/styles.ts').matchAll(/^export \{ (\w+) \} from '\.\.\/src\/styles\/presets\/(\w+)\.ts'$/gm)]

    expect(exported.map((match) => match[1])).toEqual(exported.map((match) => match[2]))
    expect(exported.map((match) => match[1]).sort()).toEqual([...presetFiles].sort())
    expect(read('lib/styles.ts').trim().split('\n')).toHaveLength(presetFiles.length)
  })

  it('runs the contract tests on every style that is exported', () => {
    expect(Object.keys(builtInStyles).sort()).toEqual([...presetFiles].sort())
  })

  it('does not put a style on the theme entry or on the main entry', () => {
    for (const file of ['lib/theme.ts', 'lib/index.ts']) expect(read(file)).not.toMatch(/shadcn|enchase\.ts|presets/)
  })
})
