import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import path from 'node:path'

interface Manifest {
  browserslist: string[]
  engines: { node: string }
  peerDependencies: Record<string, string>
  devDependencies: Record<string, string>
}

const root = path.resolve(__dirname, '../../..')

const read = (file: string) => readFileSync(path.join(root, file), 'utf8')

const manifest = JSON.parse(read('package.json')) as Manifest

const readme = read('README.md')

const table = readme.slice(readme.indexOf('\n## Support\n'), readme.indexOf('\n## Quick start'))

const browsers: [string, string][] = [
  ['Chrome', 'chrome'],
  ['Edge', 'edge'],
  ['Firefox', 'firefox'],
  ['Safari', 'safari'],
  ['iOS Safari', 'ios_saf']
]

const cell = (label: string, column: 'minimum' | 'tested') => {
  const row = table.split('\n').find((line) => line.startsWith(`| ${label} |`))

  return row?.split('|').map((part) => part.trim())[column === 'minimum' ? 2 : 3]
}

const major = (text: string | undefined) => /\d+/.exec(text ?? '')?.[0]

const minimumOf = (key: string) => manifest.browserslist.find((entry) => entry.startsWith(`${key} >= `))?.split('>= ')[1]

describe('the support matrix of the README', () => {
  it('exists, with a row for each thing that it supports', () => {
    expect(table).toContain('| Minimum | Tested on |')
    expect(['React and React DOM', ...browsers.map(([label]) => label), 'Node', 'Next.js', 'Vite'].filter((label) => cell(label, 'minimum') === undefined)).toEqual([])
  })

  it.each(browsers)('gives %s the minimum of the browserslist of package.json', (label, key) => {
    expect(cell(label, 'minimum')).toBe(minimumOf(key))
  })

  it('has a row for every browser of the browserslist, and for nothing else', () => {
    expect(manifest.browserslist.map((entry) => entry.split(' >= ')[0]).sort()).toEqual(browsers.map(([, key]) => key).sort())
  })

  it('gives React the major version of its peer dependencies, and tests the one of the repository', () => {
    expect(major(manifest.peerDependencies.react)).toBe(major(manifest.peerDependencies['react-dom']))
    expect(cell('React and React DOM', 'minimum')).toBe(major(manifest.peerDependencies.react))
    expect(major(cell('React and React DOM', 'tested'))).toBe(major(manifest.devDependencies.react))
  })

  it('gives Node the version of engines as its minimum, and the one that CI runs as the tested one', () => {
    const ci = /node-version: (\d+)/.exec(read('.github/workflows/package.yml'))?.[1]

    expect(cell('Node', 'minimum')).toBe(major(manifest.engines.node))
    expect(major(cell('Node', 'tested'))).toBe(ci)
  })

  it('tests the major version of Next.js and of Vite that the scripts install', () => {
    expect(major(cell('Next.js', 'tested'))).toBe(/next@(\d+)/.exec(read('scripts/testNext.mjs'))?.[1])
    expect(major(cell('Vite', 'tested'))).toBe(major(manifest.devDependencies.vite))
  })
})
