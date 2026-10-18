import { Card } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Componentes/Card',
  component: Card,
  args: {
    variant: 'default',
    children: 'Conteúdo do cartão'
  },
  parameters: {
    docs: {
      description: {
        component: 'Superfície para agrupar conteúdo, nas variantes `default`, `elevated` e `outlined`. Só a `elevated` sobe ao passar o ponteiro.'
      }
    }
  },
  argTypes: {
    variant: {
      description: 'Aparência do cartão. Só o elevated sobe ao passar o ponteiro.',
      control: 'select',
      options: ['default', 'elevated', 'outlined'],
      table: { defaultValue: { summary: 'default' } }
    },
    padding: {
      description: 'Espaçamento interno (qualquer valor CSS). Sem ele vale o espaçamento padrão, que a classe de quem usa sempre vence.',
      control: 'text'
    },
    animation: {
      description: 'false desliga o movimento. { tuning: { duration, distance } } ajusta o lift (segundos e pixels). O lift só roda com ponteiro fino e sem preferência de movimento reduzido.',
      control: 'object',
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'lift' } }
    },
    className: {
      description: 'Classe do cartão (data-slot="card"). Também dá para estilizar por data-variant e data-motion.',
      control: 'text'
    },
    children: { control: 'text' },
    style: { control: false }
  }
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Elevated: Story = {
  args: { variant: 'elevated' }
}

export const Outlined: Story = {
  args: { variant: 'outlined' }
}

export const NoLift: Story = {
  args: { variant: 'elevated', animation: false }
}
