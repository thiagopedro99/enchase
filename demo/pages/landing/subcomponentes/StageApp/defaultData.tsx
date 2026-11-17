import { ChartIcon, FolderIcon, HomeIcon, SettingsIcon, UsersIcon } from '../../icons.tsx'

export const product = 'Atlas'

export const navigation = [
  { id: 'overview', label: 'Visão geral', icon: <HomeIcon size={18} />, current: true },
  { id: 'projects', label: 'Projetos', icon: <FolderIcon size={18} />, current: false },
  { id: 'team', label: 'Equipe', icon: <UsersIcon size={18} />, current: false },
  { id: 'reports', label: 'Relatórios', icon: <ChartIcon size={18} />, current: false },
  { id: 'settings', label: 'Ajustes', icon: <SettingsIcon size={18} />, current: false }
]

export const trail = [
  { value: 'projects', label: 'Projetos', href: '#' },
  { value: 'atlas', label: 'Atlas', href: '#' },
  { value: 'overview', label: 'Visão geral' }
]

export const team = ['Ana Ribeiro', 'Caio Lima', 'Bia Santos']

export const account = { name: 'Ana Ribeiro', role: 'Administradora' }
