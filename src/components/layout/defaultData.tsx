import { BookOpenIcon } from '../common/Icon/icons/BookOpenIcon.tsx'
import { HomeIcon } from '../common/Icon/icons/HomeIcon.tsx'

import type { SidebarSection } from '../common/Sidebar/types.ts'

export const defaultBrand = 'Enchase'

export const defaultBrandLogo = '/enchase-marca.svg'

export const defaultCentered = false

export const docsUrl = import.meta.env.DEV ? 'http://localhost:6006' : '/docs/'

export const defaultNavigationSections: SidebarSection[] = [
  {
    id: 'navigation',
    title: 'Navegação',
    items: [
      { id: 'home', label: 'Início', icon: <HomeIcon />, href: '/' },
      { id: 'docs', label: 'Documentação', icon: <BookOpenIcon />, href: docsUrl, native: true }
    ]
  }
]
