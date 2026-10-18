import { Button, InlineLoading } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Componentes/InlineLoading',
  component: InlineLoading,
  args: {
    size: 'sm'
  },
  argTypes: {
    size: {
      description: 'Diâmetro do anel, para usar ao lado de um texto ou dentro de um botão.',
      control: 'inline-radio',
      options: ['xs', 'sm', 'md'],
      table: { defaultValue: { summary: 'sm' } }
    },
    color: {
      description: 'Cor do trecho que gira (qualquer cor CSS).',
      control: 'color'
    },
    label: {
      description: 'Texto só para leitores de tela. Sem ele, anuncia labels.loading do UIProvider.',
      control: 'text'
    },
    animation: {
      description: 'false para de girar. { tuning: { duration } } muda a volta completa em segundos. Com movimento reduzido o giro vira um pulso de opacidade.',
      control: 'object',
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'spin' } }
    },
    className: {
      description: 'Classe do elemento raiz (data-slot="inline-loading").',
      control: 'text'
    },
    style: { control: false }
  },
  parameters: {
    docs: {
      description: {
        component: 'Indicador de carregamento em linha: um span com role="status" e o anel. Para cobrir um bloco ou a página inteira, use o Loading.'
      }
    }
  }
} satisfies Meta<typeof InlineLoading>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const InsideAButton: Story = {
  render: (args) => (
    <Button disabled>
      <InlineLoading {...args} label="Salvando" /> Salvando
    </Button>
  )
}
