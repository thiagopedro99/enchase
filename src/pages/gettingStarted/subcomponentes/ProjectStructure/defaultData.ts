import type { FolderEntry } from './types.ts'

export const folderEntries: FolderEntry[] = [
  { level: 0, label: '📁 src/' },
  { level: 1, label: '📁 assets/ - Imagens, fontes, ícones' },
  { level: 1, label: '📁 components/ - Componentes reutilizáveis' },
  { level: 2, label: '📁 common/ - Componentes básicos (Button, Input, etc)' },
  { level: 2, label: '📁 layout/ - Layout principal da aplicação' },
  { level: 2, label: '📁 navbar/ - Barra de navegação' },
  { level: 2, label: '📁 footer/ - Rodapé' },
  { level: 2, label: '📁 toast/ - Sistema de notificações' },
  { level: 1, label: '📁 hooks/ - Custom hooks React' },
  { level: 1, label: '📁 pages/ - Páginas da aplicação' },
  { level: 1, label: '📁 routes/ - Configuração de rotas' },
  { level: 1, label: '📁 actions/ - Chamadas de API por entidade' },
  { level: 1, label: '📁 stores/ - Gerenciamento de estado (Zustand)' },
  { level: 1, label: '📁 types/ - Tipos compartilhados entre entidades' },
  { level: 1, label: '📁 styles/ - Temas e estilos globais' },
  { level: 1, label: '📁 utils/ - Funções utilitárias' }
]
