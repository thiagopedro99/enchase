import type { SidebarSection } from '@components/common/Sidebar/types.ts'

export const pageSections: SidebarSection[] = [
  {
    id: 'page',
    title: 'Nesta página',
    items: [
      { id: 'intro', label: 'Introdução', href: '#intro' },
      { id: 'usage', label: 'Uso', href: '#usage' }
    ]
  }
]
