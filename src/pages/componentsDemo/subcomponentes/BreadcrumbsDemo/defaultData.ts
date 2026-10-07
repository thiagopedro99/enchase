import type { BreadcrumbItem } from '@components/common/Breadcrumbs/types.ts'

export const shortTrail: BreadcrumbItem[] = [
  { id: 'home', label: 'Início', href: '#breadcrumbs' },
  { id: 'components', label: 'Componentes', href: '#breadcrumbs' },
  { id: 'breadcrumbs', label: 'Breadcrumbs' }
]

export const longTrail: BreadcrumbItem[] = [
  { id: 'home', label: 'Início', href: '#breadcrumbs' },
  { id: 'workspace', label: 'Workspace', href: '#breadcrumbs' },
  { id: 'projects', label: 'Projetos', href: '#breadcrumbs' },
  { id: 'aurora', label: 'Aurora', href: '#breadcrumbs' },
  { id: 'settings', label: 'Configurações', href: '#breadcrumbs' },
  { id: 'access', label: 'Controle de acesso' }
]
