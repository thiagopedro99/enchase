import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(__dirname, '../../..')

const read = (file: string) => readFileSync(path.join(root, '.github/workflows', file), 'utf8')

const listsOf = (workflow: string, key: string) => [...workflow.matchAll(new RegExp(`^ {4}${key}:\\n((?: {6}- .+\\n)+)`, 'gm'))].map(([, block = '']) => [...block.matchAll(/^ {6}- '?([^'\n]+)'?$/gm)].map(([, entry = '']) => entry))

const ignored = (file: string) => listsOf(read(file), 'paths-ignore')

const site = listsOf(read('site.yml'), 'paths')

const light = ['CONTRIBUTING.md', 'CLAUDE.md', 'skill.md', 'demo/**', 'worker/**', 'src/tests/demo/**', 'src/tests/worker/**', 'tsconfig.worker.json', '.github/workflows/site.yml']

describe('the paths that choose which workflow runs', () => {
  it('are the same for a push and for a pull request, in each workflow', () => {
    expect(ignored('package.yml')).toHaveLength(2)
    expect(ignored('package.yml')[0]).toEqual(ignored('package.yml')[1])
    expect(ignored('browser-tests.yml')[0]).toEqual(ignored('browser-tests.yml')[1])
    expect(site).toHaveLength(2)
    expect(site[0]).toEqual(site[1])
  })

  it('skip the package and the browsers for the same files', () => {
    expect([...(ignored('browser-tests.yml')[0] ?? [])].sort()).toEqual([...(ignored('package.yml')[0] ?? [])].sort())
  })

  it('send to the site workflow exactly what the package workflow skips for being of the site or a document out of the package', () => {
    expect([...(site[0] ?? [])].sort()).toEqual([...light].sort())
    expect(ignored('package.yml')[0]).toEqual(expect.arrayContaining(light))
  })

  it('run in the site workflow the test that reads a document that the package workflow skips', () => {
    expect(read('site.yml')).toMatch(/^ {6}- run: npx vitest run .*src\/tests\/lib\/docsLanguage\.test\.ts.*$/m)
    expect(read('site.yml')).toMatch(/src\/tests\/lib\/ciPaths\.test\.ts/)
  })

  it('reads the lists of a workflow', () => {
    const workflow = ['on:', '  push:', '    branches: [dev]', '    paths-ignore:', '      - Dockerfile', "      - 'demo/**'", '  pull_request:', '    paths-ignore:', '      - Dockerfile', ''].join('\n')

    expect(listsOf(workflow, 'paths-ignore')).toEqual([['Dockerfile', 'demo/**'], ['Dockerfile']])
    expect(listsOf(workflow, 'paths')).toEqual([])
  })
})
