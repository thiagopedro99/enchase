import { FileText, Home, Settings, Users } from 'lucide-react'

import type { SidebarSection } from '@components/common/Sidebar/types.ts'

export const demoSections: SidebarSection[] = [
  {
    id: 'workspace',
    title: 'Workspace',
    items: [
      { id: 'inicio', label: 'Início', icon: Home, href: '#sidebar' },
      { id: 'relatorios', label: 'Relatórios', icon: FileText, badge: '3' },
      { id: 'equipe', label: 'Equipe', icon: Users }
    ]
  },
  {
    id: 'account',
    title: 'Conta',
    items: [{ id: 'configuracoes', label: 'Configurações', icon: Settings }]
  }
]
