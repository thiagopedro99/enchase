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

const styleEntries = sourcesIn('lib/styles')

const packageExports = JSON.parse(read('package.json')).exports as Record<string, unknown>

const mayImportPresets = (file: string) => file.startsWith('src/styles/presets/') || file.startsWith('lib/styles/') || file.startsWith('src/tests/') || file.startsWith('src/tests-browser/')

describe('each style is an entry of its own', () => {
  it('is imported only by the entry of the style and by the tests', () => {
    const importers = [...sourcesIn('src'), ...sourcesIn('lib'), ...sourcesIn('demo')].filter((file) => specifiersOf(file).some(reachesPresets))

    expect(importers.filter((file) => !mayImportPresets(file))).toEqual([])
    expect(importers).toEqual(expect.arrayContaining(styleEntries))
  })

  it('keeps every other public entry free of the styles', () => {
    for (const entry of sourcesIn('lib').filter((file) => !file.startsWith('lib/styles/'))) {
      expect(specifiersOf(entry).filter(reachesPresets), entry).toEqual([])
    }
  })

  it('keeps each style as data, which imports only defineStyle and the types it is made of', () => {
    for (const file of sourcesIn('src/styles/presets')) {
      expect(specifiersOf(file).filter((specifier) => !['../theme/style.ts', '../tokens/types.ts'].includes(specifier)), file).toEqual([])
    }
  })

  it('has one file in lib/styles for each style, named after it, that exports that style and nothing else', () => {
    expect(styleEntries.map((file) => path.posix.basename(file, '.ts')).sort()).toEqual([...presetFiles].sort())

    for (const name of presetFiles) expect(read(`lib/styles/${name}.ts`).trim()).toBe(`export { ${name} } from '../../src/styles/presets/${name}.ts'`)
  })

  it('exports each style from the package as styles/<name>, built to the same name, and nothing else under styles', () => {
    expect(Object.keys(packageExports).filter((key) => key.startsWith('./styles/')).sort()).toEqual(presetFiles.map((name) => `./styles/${name}`).sort())

    for (const name of presetFiles) {
      expect(packageExports[`./styles/${name}`]).toEqual({ types: `./dist-lib/types/lib/styles/${name}.d.ts`, import: `./dist-lib/styles/${name}.js`, default: `./dist-lib/styles/${name}.js` })
    }
  })

  it('does not export enchase/styles alone, so forgetting the .css of enchase/styles.css fails instead of importing code that does nothing', () => {
    expect(packageExports).not.toHaveProperty('./styles')
    expect(packageExports).not.toHaveProperty('./styles/*')
    expect(packageExports).toHaveProperty('./styles.css')
    expect(packageExports).toHaveProperty('./styles.layer.css')
  })

  it('runs the contract tests on every style that is exported', () => {
    expect(Object.keys(builtInStyles).sort()).toEqual([...presetFiles].sort())
  })

  it('does not put a style on the theme entry or on the main entry', () => {
    for (const file of ['lib/theme.ts', 'lib/index.ts']) expect(read(file)).not.toMatch(/shadcn|enchase\.ts|presets/)
  })
})
