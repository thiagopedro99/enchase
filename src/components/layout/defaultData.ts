import { BookOpen, Home } from 'lucide-react'

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
      { id: 'home', label: 'Início', icon: Home, to: '/' },
      { id: 'docs', label: 'Documentação', icon: BookOpen, href: docsUrl }
    ]
  }
]
