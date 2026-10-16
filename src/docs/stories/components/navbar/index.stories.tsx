import { Icon, Navbar } from 'enchase'

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
    logo: { description: 'Marca exibida à esquerda (ou à direita em rtl). Aceita texto ou qualquer nó React, como uma imagem ou um SVG. É um link para logoHref (data-slot="navbar-logo").', control: 'text' },
    logoHref: { description: 'Destino do link da marca. Aceita uma rota, uma âncora (#inicio) ou uma URL.', control: 'text', table: { defaultValue: { summary: '/' } } },
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

export const LogoComImagem: Story = {
  args: {
    logo: (
      <>
        <Icon size={28}>
          <path d="M12 3 3 8v8l9 5 9-5V8z" />
        </Icon>{' '}
        Enchase
      </>
    ),
    logoHref: '#inicio'
  }
}
