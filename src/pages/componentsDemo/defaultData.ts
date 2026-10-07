import { AppWindow, Bell, ChevronsUpDown, Columns3, Grid3x3, Layers, Loader, MousePointerClick, PanelLeft, Palette, Route, Rows3, Shapes, SquareCheck, TextCursorInput, Type } from 'lucide-react'

import type { SidebarSection } from '@components/common/Sidebar/types.ts'

export const pageSections: SidebarSection[] = [
  {
    id: 'foundations',
    title: 'Fundamentos',
    items: [
      { id: 'cores', label: 'Cores', icon: Palette, href: '#cores' },
      { id: 'tipografia', label: 'Tipografia', icon: Type, href: '#tipografia' },
      { id: 'forma-e-elevacao', label: 'Forma e elevação', icon: Shapes, href: '#forma-e-elevacao' }
    ]
  },
  {
    id: 'components',
    title: 'Componentes',
    items: [
      { id: 'botoes', label: 'Botões', icon: MousePointerClick, href: '#botoes' },
      { id: 'inputs', label: 'Inputs', icon: TextCursorInput, href: '#inputs' },
      { id: 'select', label: 'Select', icon: ChevronsUpDown, href: '#select' },
      { id: 'checkbox', label: 'Checkbox', icon: SquareCheck, href: '#checkbox' },
      { id: 'modais', label: 'Modais', icon: AppWindow, href: '#modais' },
      { id: 'loading', label: 'Loading', icon: Loader, href: '#loading' },
      { id: 'cards', label: 'Cards', icon: Layers, href: '#cards' },
      { id: 'toasts', label: 'Toasts', icon: Bell, href: '#toasts' },
      { id: 'skeleton', label: 'Skeleton', icon: Rows3, href: '#skeleton' },
      { id: 'sidebar', label: 'Sidebar', icon: PanelLeft, href: '#sidebar' },
      { id: 'breadcrumbs', label: 'Breadcrumbs', icon: Route, href: '#breadcrumbs' },
      { id: 'flex', label: 'Flex', icon: Columns3, href: '#flex' },
      { id: 'grid', label: 'Grid', icon: Grid3x3, href: '#grid' }
    ]
  }
]

export const sectionIds = pageSections.flatMap((section) => section.items.map((item) => item.id))
