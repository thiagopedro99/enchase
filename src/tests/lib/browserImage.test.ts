import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(__dirname, '../../..')

const workflows = ['browser-tests.yml', 'stories-a11y.yml']

const read = (file: string) => readFileSync(path.join(root, file), 'utf8')

const lock = JSON.parse(read('package-lock.json')) as { packages: Record<string, { version: string } | undefined> }

const imageVersions = (workflow: string) => [...workflow.matchAll(/^\s*image:\s*mcr\.microsoft\.com\/playwright:v(\d+\.\d+\.\d+)-noble\s*$/gm)].map((match) => match[1])

describe('the Playwright image of the workflows that drive a browser', () => {
  it.each(workflows)('in %s is the version of the playwright package in the lockfile, so the browsers match the revisions the tests drive', (workflow) => {
    expect(imageVersions(read(`.github/workflows/${workflow}`))).toEqual([lock.packages['node_modules/playwright']?.version])
  })

  it('finds the version of an image and ignores the other lines', () => {
    const workflow = ['jobs:', '  browser:', '    container:', '      image: mcr.microsoft.com/playwright:v1.2.3-noble', '      options: --ipc=host', '  other:', '    container:', '      image: node:22'].join('\n')

    expect(imageVersions(workflow)).toEqual(['1.2.3'])
    expect(imageVersions('image: mcr.microsoft.com/playwright:v1.2.3-jammy')).toEqual([])
  })
})
