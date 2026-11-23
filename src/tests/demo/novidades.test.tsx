import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

import { currentVersion, releases } from '@demo/pages/novidades/defaultData.ts'
import Novidades from '@demo/pages/novidades/index.tsx'
import { changelogUrl } from '@demo/defaultData.ts'
import manifest from '../../../package.json'

const headingLevels = () => screen.getAllByRole('heading').map((heading) => Number(heading.tagName.slice(1)))

const numbers = (version: string) => version.split('.').map(Number)

const newer = (a: string, b: string) => {
  const [left, right] = [numbers(a), numbers(b)]
  const index = left.findIndex((part, position) => part !== right[position])

  return index !== -1 && (left[index] ?? 0) > (right[index] ?? 0)
}

describe('Release notes data', () => {
  it('has an entry for the version in package.json, and it is the first one', () => {
    expect(currentVersion).toBe(manifest.version)
  })

  it('lists the versions from the newest to the oldest, each one once', () => {
    const versions = releases.map(({ version }) => version)

    expect(new Set(versions).size).toBe(versions.length)

    versions.slice(1).forEach((version, index) => expect(newer(versions[index] ?? '', version)).toBe(true))
  })

  it('compares each version with the one right before it in the list', () => {
    releases.slice(0, -1).forEach(({ previous }, index) => expect(previous).toBe(releases[index + 1]?.version))
  })

  it('says something about every version', () => {
    for (const { title, summary, groups } of releases) {
      expect(title).not.toBe('')
      expect(summary).not.toBe('')
      expect(groups.flatMap(({ items }) => items).length).toBeGreaterThan(0)
    }
  })
})

describe('Release notes page', () => {
  it('has no axe violations', async () => {
    const { container } = renderWithProviders(<Novidades />, { route: '/novidades' })

    expect(await axe(container)).toHaveNoViolations()
  })

  it('exposes one h1 and never skips a heading level', () => {
    renderWithProviders(<Novidades />, { route: '/novidades' })

    const levels = headingLevels()

    expect(levels.filter((level) => level === 1)).toHaveLength(1)

    levels.slice(1).forEach((level, index) => expect(level - (levels[index] ?? 0)).toBeLessThanOrEqual(1))
  })

  it('draws one article per version, named by its title', () => {
    renderWithProviders(<Novidades />, { route: '/novidades' })

    expect(screen.getAllByRole('article').map((article) => article.getAttribute('aria-labelledby'))).toHaveLength(releases.length)

    for (const { title } of releases) expect(screen.getByRole('article', { name: title })).toBeInTheDocument()
  })

  it('keeps only the versions that change behavior when the switch is on', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Novidades />, { route: '/novidades' })

    await user.click(screen.getByRole('switch', { name: 'Só as que mudam comportamento' }))

    expect(screen.getAllByRole('article')).toHaveLength(releases.filter(({ behavior }) => behavior).length)

    await user.click(screen.getByRole('switch', { name: 'Só as que mudam comportamento' }))

    expect(screen.getAllByRole('article')).toHaveLength(releases.length)
  })

  it('marks the current page in the menu and names the page in the title', () => {
    renderWithProviders(<Novidades />, { route: '/novidades' })

    const menu = screen.getByRole('navigation', { name: 'Navegação principal' })

    expect(within(menu).getByRole('link', { name: 'Novidades' })).toHaveAttribute('aria-current', 'page')
    expect(document.title).toBe('Novidades · Enchase')
  })

  it('sends the technical changelog to GitHub in a new tab', () => {
    renderWithProviders(<Novidades />, { route: '/novidades' })

    const link = screen.getByRole('link', { name: /^Changelog técnico/ })

    expect(link).toHaveAttribute('href', changelogUrl)
    expect(link).toHaveAttribute('target', '_blank')
  })
})
