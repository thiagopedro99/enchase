import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(__dirname, '../../..')

const read = (file: string) => readFileSync(path.join(root, file), 'utf8')

const workflow = read('.github/workflows/stories-a11y.yml')

const script = read('scripts/auditStories.mjs')

const combinations = [...script.matchAll(/\{ name: '(light|dark):([a-z0-9]+)', theme: '\1', style: '\2' \}/g)].map(([, theme, style]) => `${theme}:${style}`)

const stylesOf = (text: string) =>
  (/^\s*style: \[([^\]]+)\]\s*$/m.exec(text)?.[1] ?? '')
    .split(',')
    .map((style) => style.trim())
    .filter((style) => style !== '')

const themesOf = (text: string) => [...text.matchAll(/^\s*- run: npm run test:stories-a11y -- --combo=(light|dark):\$\{\{ matrix\.style \}\}\s*$/gm)].map(([, theme]) => theme)

describe('the workflow that audits the stories in parallel', () => {
  it('runs every combination of the audit script, one job for each style, so a new style is not left out', () => {
    const audited = stylesOf(workflow).flatMap((style) => themesOf(workflow).map((theme) => `${theme}:${style}`))

    expect(combinations.length).toBeGreaterThanOrEqual(10)
    expect([...audited].sort()).toEqual([...combinations].sort())
  })

  it('keeps the other styles running when one fails, and the dark theme when the light one fails', () => {
    expect(workflow).toMatch(/^\s*fail-fast: false\s*$/m)
    expect(workflow).toMatch(/--combo=dark:\$\{\{ matrix\.style \}\}\n\s*if: success\(\) \|\| failure\(\)/)
  })

  it('reads the styles and the themes of a workflow', () => {
    const text = ['    strategy:', '      matrix:', '        style: [one, two]', '    steps:', '      - run: npm run test:stories-a11y -- --combo=light:${{ matrix.style }}', '      - run: npm run test:stories-a11y'].join('\n')

    expect(stylesOf(text)).toEqual(['one', 'two'])
    expect(themesOf(text)).toEqual(['light'])
    expect(stylesOf('steps:')).toEqual([])
  })
})
