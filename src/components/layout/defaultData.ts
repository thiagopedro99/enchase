import { Home } from 'lucide-react'

import type { SidebarSection } from '../common/Sidebar/types.ts'

export const defaultBrand = 'Enchase'

export const defaultBrandLogo = '/enchase-marca.svg'

export const defaultCentered = false

export const defaultNavigationSections: SidebarSection[] = [
  {
    id: 'navigation',
    title: 'Navegação',
    items: [{ id: 'home', label: 'Início', icon: Home, to: '/' }]
  }
]
