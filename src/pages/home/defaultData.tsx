import { BookOpenIcon } from '@components/common/Icon/icons/BookOpenIcon.tsx'
import { HomeIcon } from '@components/common/Icon/icons/HomeIcon.tsx'

import type { SidebarSection } from '@components/common/Sidebar/types.ts'

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
