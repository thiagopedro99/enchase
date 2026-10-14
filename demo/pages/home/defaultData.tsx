import { BookOpenIcon, HomeIcon } from './icons.tsx'

import type { SidebarSection } from 'enchase'

export const repositoryUrl = 'https://github.com/thiagopedro99/enchase'

export const brand = 'Enchase'

export const brandLogo = '/enchase-marca.svg'

export const footerProps = { companyName: 'Enchase', notice: 'Licença MIT.' }

export const docsUrl = import.meta.env.DEV ? 'http://localhost:6006' : '/docs/'

export const navigationSections: SidebarSection[] = [
  {
    id: 'navigation',
    title: 'Navegação',
    items: [
      { id: 'home', label: 'Início', icon: <HomeIcon />, href: '/' },
      { id: 'docs', label: 'Documentação', icon: <BookOpenIcon />, href: docsUrl, native: true }
    ]
  }
]
