import { HomeIcon } from '@components/common/Icon/icons/HomeIcon.tsx'
import { LayoutGridIcon } from '@components/common/Icon/icons/LayoutGridIcon.tsx'
import { RocketIcon } from '@components/common/Icon/icons/RocketIcon.tsx'

import type { SidebarSection } from '@components/common/Sidebar/types.ts'

export const navigationSections: SidebarSection[] = [
  {
    id: 'navigation',
    title: 'Navegação',
    items: [
      { id: 'home', label: 'Início', icon: <HomeIcon />, href: '/' },
      { id: 'getting-started', label: 'Primeiros passos', icon: <RocketIcon />, href: '/getting-started' },
      { id: 'components', label: 'Componentes', icon: <LayoutGridIcon />, href: '/components' }
    ]
  }
]
