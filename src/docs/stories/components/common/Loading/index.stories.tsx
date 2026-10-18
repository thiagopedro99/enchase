import { InlineLoading, Loading } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Componentes/Loading',
  component: Loading,
  args: {
    size: 'md',
    overlay: false
  },
  parameters: {
    docs: {
      description: {
        component: 'Indicador de carregamento em anel, com texto opcional. Com `overlay`, cobre a página, deixa o resto inerte e trava a rolagem.'
      }
    }
  },
  argTypes: {
    size: {
      description: 'Diâmetro do anel.',
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      table: { defaultValue: { summary: 'md' } }
    },
    overlay: {
      description: 'Cobre a página, deixa o resto inerte e trava a rolagem enquanto estiver montado.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    text: {
      description: 'Texto visível. Sem ele o leitor de tela anuncia labels.loading.',
      control: 'text'
    },
    color: {
      description: 'Cor do trecho que gira (qualquer cor CSS).',
      control: 'color'
    },
    animation: {
      description: 'false para de girar. { tuning: { duration } } muda a volta completa em segundos. Com movimento reduzido o giro vira um pulso de opacidade.',
      control: 'object',
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'spin' } }
    },
    className: {
      description: 'Classe do elemento raiz (data-slot="loading").',
      control: 'text'
    },
    style: { control: false }
  }
} satisfies Meta<typeof Loading>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithText: Story = {
  args: { text: 'Salvando alterações' }
}

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Loading key={size} {...args} size={size} />
      ))}
    </div>
  )
}

export const Inline: Story = {
  render: () => (
    <p>
      Enviando <InlineLoading label="Enviando" />
    </p>
  )
}

export const NoAnimation: Story = {
  args: { animation: false }
}
