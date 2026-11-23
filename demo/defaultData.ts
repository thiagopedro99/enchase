import type { FooterProps, SidebarItem, SidebarSection } from 'enchase'

export const brand = 'Enchase'

export const repositoryUrl = 'https://github.com/thiagopedro99/enchase'

export const packageUrl = 'https://www.npmjs.com/package/enchase'

export const changelogUrl = `${repositoryUrl}/blob/main/CHANGELOG.md`

export const issuesUrl = `${repositoryUrl}/issues`

export const suggestUrl = `${repositoryUrl}/issues/new?template=feature_request.md`

export const docsUrl = import.meta.env.DEV ? 'http://localhost:6006' : '/docs/'

export const routes = {
  home: '/',
  news: '/novidades',
  suggestions: '/sugestoes'
}

export const pageLinks: SidebarItem[] = [
  { id: 'novidades', label: 'Novidades', href: routes.news },
  { id: 'sugestoes', label: 'Sugestões', href: routes.suggestions },
  { id: 'docs', label: 'Documentação', href: docsUrl, native: true }
]

export const siteNavigation: SidebarSection[] = [
  {
    id: 'site',
    items: [{ id: 'inicio', label: 'Início', href: routes.home }, ...pageLinks]
  }
]

export const footerProps: FooterProps = {
  companyName: brand,
  notice: 'Licença MIT.',
  links: [
    { label: 'Documentação', href: docsUrl },
    { label: 'GitHub', href: repositoryUrl },
    { label: 'npm', href: packageUrl },
    { label: 'Novidades', href: routes.news },
    { label: 'Sugestões', href: routes.suggestions }
  ]
}
