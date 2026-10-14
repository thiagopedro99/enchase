import { Navbar } from 'enchase'

import type { SidebarSection } from 'enchase'
import type { Meta, StoryObj } from '@storybook/react-vite'

const sections: SidebarSection[] = [
  {
    id: 'main',
    items: [
      { id: 'home', label: 'Início', href: '/' },
      { id: 'docs', label: 'Documentação', href: '/docs' },
      { id: 'api', label: 'API', href: '/api' }
    ]
  }
]

const meta = {
  title: 'Componentes/Navbar',
  component: Navbar,
  parameters: { layout: 'fullscreen' },
  args: { logo: 'Enchase', sections },
  argTypes: {
    logo: { description: 'Nome exibido à esquerda (ou à direita em rtl), que leva à raiz.', control: 'text' },
    activeSectionId: { description: 'Id do item de âncora marcado como localização atual.', control: 'text' },
    className: {
      description: 'Classe do cabeçalho (data-slot="navbar"). As partes seguem data-slot="navbar-*"; o drawer mobile é navbar-drawer, com data-state.',
      control: 'text'
    },
    sections: { control: false },
    style: { control: false }
  }
} satisfies Meta<typeof Navbar>

export default meta

type Story = StoryObj<typeof meta>

export const Padrao: Story = {}
