import { Home, LayoutGrid, Rocket } from 'lucide-react'

import type { SidebarSection } from '@components/common/Sidebar/types.ts'

export const navigationSections: SidebarSection[] = [
  {
    id: 'navigation',
    title: 'Navegação',
    items: [
      { id: 'home', label: 'Início', icon: Home, to: '/' },
      { id: 'getting-started', label: 'Primeiros passos', icon: Rocket, to: '/getting-started' },
      { id: 'components', label: 'Componentes', icon: LayoutGrid, to: '/components' }
    ]
  }
]
