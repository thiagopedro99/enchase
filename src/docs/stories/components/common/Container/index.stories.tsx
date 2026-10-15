import { Container } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const box = { background: 'var(--enchase-color-surface-container)', padding: '1rem', borderRadius: 'var(--enchase-radius-md)' }

const meta = {
  title: 'Componentes/Container',
  component: Container,
  parameters: { layout: 'fullscreen' },
  args: {
    maxWidth: 'lg',
    padding: true,
    center: true,
    children: <div style={box}>Conteúdo limitado pela largura máxima</div>
  },
  argTypes: {
    maxWidth: {
      description: 'Largura máxima, tirada dos breakpoints do UIProvider (sm 576, md 768, lg 992, xl 1200, xxl 1400 px por padrão). full não limita. 2xl continua aceito como alias de xxl.',
      control: 'inline-radio',
      options: ['sm', 'md', 'lg', 'xl', 'xxl', 'full'],
      table: { defaultValue: { summary: 'lg' } }
    },
    padding: {
      description: 'true usa o espaçamento padrão nas laterais, false remove, e um texto CSS define o valor (variável --enchase-container-padding).',
      control: 'text',
      table: { defaultValue: { summary: 'true' } }
    },
    center: {
      description: 'Centraliza o container. Com false ele fica no início, e em RTL no lado direito.',
      control: 'boolean',
      table: { defaultValue: { summary: 'true' } }
    },
    className: { description: 'Classe da raiz (data-slot="container"), que vence os estilos padrão.', control: 'text' },
    style: { control: false }
  }
} satisfies Meta<typeof Container>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Narrow: Story = {
  args: { maxWidth: 'sm' }
}

export const FullWidth: Story = {
  args: { maxWidth: 'full', padding: '2rem' }
}

export const StartAligned: Story = {
  args: { maxWidth: 'md', center: false }
}
