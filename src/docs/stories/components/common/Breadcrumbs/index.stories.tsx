import { Breadcrumbs } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Componentes/Breadcrumbs',
  component: Breadcrumbs,
  args: {
    items: [
      { id: 'home', label: 'Início', href: '/' },
      { id: 'docs', label: 'Documentação', href: '/docs' },
      { id: 'api', label: 'API' }
    ],
    maxItems: 4
  },
  argTypes: {
    items: {
      description: 'Trilha em ordem. O último item é a página atual; os demais viram links quando têm href.',
      control: 'object'
    },
    maxItems: {
      description: 'Acima desse número, o miolo vira um botão de reticências que mostra o caminho completo.',
      control: 'number'
    },
    className: {
      description: 'Classe do usuário, aplicada na raiz depois da classe da biblioteca. Também aceita style e data-slot nas partes.',
      control: false
    }
  }
} satisfies Meta<typeof Breadcrumbs>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Collapsed: Story = {
  args: {
    items: [
      { id: 'a', label: 'Nível A', href: '/a' },
      { id: 'b', label: 'Nível B', href: '/b' },
      { id: 'c', label: 'Nível C', href: '/c' },
      { id: 'd', label: 'Nível D', href: '/d' },
      { id: 'e', label: 'Nível E', href: '/e' },
      { id: 'f', label: 'Nível F' }
    ],
    maxItems: 4
  }
}
