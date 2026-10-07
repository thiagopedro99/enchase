import { pageSections } from '@tests/shared/fixtures/pageSections.ts'
import { describe, expect, it } from 'vitest'

import { deriveBreadcrumbs } from '@components/layout/breadcrumbs.ts'

import type { SidebarSection } from '@components/common/Sidebar/types.ts'

const sections: SidebarSection[] = [
  {
    id: 'nav',
    items: [
      { id: 'home', label: 'Início', to: '/' },
      { id: 'docs', label: 'Docs', to: '/docs' },
      { id: 'docs-api', label: 'API', to: '/docs/api' },
      { id: 'anchor', label: 'Âncora', href: '#x' }
    ]
  }
]

const derive = (pathname: string, activePageSectionId?: string, overrides: Partial<Parameters<typeof deriveBreadcrumbs>[0]> = {}) =>
  deriveBreadcrumbs({ sections, pageSections, pathname, pageTitle: 'Título da página', activePageSectionId, ...overrides })

describe('deriveBreadcrumbs', () => {
  it('returns only the home item on the home route', () => {
    expect(derive('/')).toEqual([{ id: 'home', label: 'Início', to: '/' }])
  })

  it('prefixes the home link before another route', () => {
    expect(derive('/docs')).toEqual([
      { id: 'home', label: 'Início', to: '/' },
      { id: 'docs', label: 'Docs', to: '/docs' }
    ])
  })

  it('matches the most specific route for nested paths', () => {
    expect(derive('/docs/api').map((item) => item.id)).toEqual(['home', 'docs-api'])
    expect(derive('/docs/api/v2').map((item) => item.id)).toEqual(['home', 'docs-api'])
  })

  it('does not treat a path prefix without a separator as a match', () => {
    expect(derive('/documentos').map((item) => item.id)).toEqual(['home', 'current-page'])
  })

  it('falls back to the page title when no route matches', () => {
    expect(derive('/nao-existe')).toEqual([
      { id: 'home', label: 'Início', to: '/' },
      { id: 'current-page', label: 'Título da página' }
    ])
  })

  it('appends the active page section as the last crumb', () => {
    const trail = derive('/docs', 'intro')

    expect(trail.map((item) => item.id)).toEqual(['home', 'docs', 'intro'])
    expect(trail[2]).toEqual({ id: 'intro', label: 'Introdução', href: '#intro' })
  })

  it('ignores an unknown active section', () => {
    expect(derive('/docs', 'nope').map((item) => item.id)).toEqual(['home', 'docs'])
  })

  it('works without a home route', () => {
    expect(derive('/docs', undefined, { sections: [{ id: 'nav', items: [{ id: 'docs', label: 'Docs', to: '/docs' }] }] })).toEqual([{ id: 'docs', label: 'Docs', to: '/docs' }])
  })

  it('ignores items that are not routes', () => {
    expect(derive('/anything').map((item) => item.id)).not.toContain('anchor')
  })
})
