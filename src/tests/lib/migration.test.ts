import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import path from 'node:path'

const root = path.resolve(__dirname, '../../..')

const read = (file: string) => readFileSync(path.join(root, file), 'utf8')

const changelog = read('CHANGELOG.md')

const index = read('MIGRATION.md')

const first = [0, 13]

const published = [...changelog.matchAll(/^## v(\d+)\.(\d+)\.0$/gm)].map((match) => [Number(match[1]), Number(match[2])]).filter(([major, minor]) => major > first[0] || (major === first[0] && minor >= first[1]))

const minors = published.map(([major, minor]) => `${major}.${minor}`)

const pages = readdirSync(path.join(root, 'docs', 'migration')).filter((file) => /^\d+\.\d+\.md$/.test(file)).map((file) => file.replace(/\.md$/, ''))

const sectionOf = (minor: string) =>
  changelog
    .split(/^## /m)
    .filter((section) => section.startsWith(`v${minor}.`))
    .join('\n')

const quotesOf = (minor: string) =>
  read(`docs/migration/${minor}.md`)
    .split('\n')
    .filter((line) => line.startsWith('> '))
    .map((line) => line.slice(2))

describe('the migration guide', () => {
  it('has a page for every minor version of the changelog from 0.13, so that a release adds its page', () => {
    expect(minors.length).toBeGreaterThanOrEqual(4)
    expect(minors.filter((minor) => !existsSync(path.join(root, 'docs', 'migration', `${minor}.md`)))).toEqual([])
  })

  it('has no page for a version that the changelog does not have', () => {
    expect(pages.filter((page) => !minors.includes(page))).toEqual([])
  })

  it('links every page from the index', () => {
    expect(pages.filter((page) => !index.includes(`docs/migration/${page}.md`))).toEqual([])
  })

  it.each(pages)('quotes only what the changelog says in the page of %s, and says where the notes are', (page) => {
    const section = sectionOf(page)
    const quotes = quotesOf(page)

    expect(quotes.length).toBeGreaterThan(1)
    expect(quotes.filter((quote) => !section.includes(quote))).toEqual([])
    expect(read(`docs/migration/${page}.md`)).toContain('(../../CHANGELOG.md#v')
  })
})
