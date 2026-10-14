import { Skeleton } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Componentes/Skeleton',
  component: Skeleton,
  args: {
    variant: 'text'
  },
  argTypes: {
    variant: {
      description: 'Forma do espaço reservado.',
      control: 'select',
      options: ['text', 'circular', 'rectangular'],
      table: { defaultValue: { summary: 'text' } }
    },
    width: {
      description: 'Largura (qualquer valor CSS). No circular, width ou height define os dois lados.',
      control: 'text'
    },
    height: {
      description: 'Altura (qualquer valor CSS).',
      control: 'text'
    },
    animation: {
      description: 'false desliga o brilho. { tuning: { duration } } muda a duração em segundos. Com movimento reduzido o brilho vira um pulso de opacidade.',
      control: 'object',
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'shimmer' } }
    },
    className: {
      description: 'Classe do elemento (data-slot="skeleton"), que vence os tamanhos e raios padrão.',
      control: 'text'
    },
    style: { control: false }
  }
} satisfies Meta<typeof Skeleton>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Circular: Story = {
  args: { variant: 'circular', width: '48px' }
}

export const Rectangular: Story = {
  args: { variant: 'rectangular', height: '120px' }
}

export const ProfileCard: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', maxInlineSize: '20rem' }}>
      <Skeleton variant="circular" width="48px" />
      <div style={{ flex: 1, display: 'grid', gap: '0.5rem' }}>
        <Skeleton width="70%" />
        <Skeleton width="40%" />
      </div>
    </div>
  )
}

export const NoAnimation: Story = {
  args: { animation: false }
}
