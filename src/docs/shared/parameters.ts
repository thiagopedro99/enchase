import type { Preview } from '@storybook/react-vite'

export const globalTypes: NonNullable<Preview['globalTypes']> = {
  theme: {
    description: 'Tema',
    toolbar: {
      title: 'Tema',
      icon: 'circlehollow',
      items: [
        { value: 'light', title: 'Claro' },
        { value: 'dark', title: 'Escuro' }
      ],
      dynamicTitle: true
    }
  },
  style: {
    description: 'Estilo visual',
    toolbar: {
      title: 'Estilo',
      icon: 'paintbrush',
      items: [
        { value: 'enchase', title: 'Enchase' },
        { value: 'shadcn', title: 'shadcn/ui' }
      ],
      dynamicTitle: true
    }
  },
  motion: {
    description: 'Modo de motion',
    toolbar: {
      title: 'Motion',
      icon: 'play',
      items: [
        { value: 'auto', title: 'Automático' },
        { value: 'never', title: 'Sem movimento' }
      ],
      dynamicTitle: true
    }
  }
}

export const initialGlobals = { theme: 'light', style: 'enchase', motion: 'auto' }

export const parameters: NonNullable<Preview['parameters']> = {
  layout: 'centered',
  controls: { expanded: true },
  options: {
    storySort: { order: ['Introdução', 'Fundamentos', 'Sistema', 'Componentes'] }
  }
}
