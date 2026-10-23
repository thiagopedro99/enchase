import { Card, Grid } from 'enchase'
import { asArgType } from '@docs/shared/argTypes.ts'

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
        component: 'Superfície para agrupar conteúdo, nas variantes `default`, `elevated` e `outlined`. Só a `elevated` sobe ao passar o ponteiro. Com `as`, a raiz vira outra tag de estrutura, como `li` de uma lista de cartões. Para um cartão inteiro clicável, use `CardLink` ou `CardButton`.'
      }
    }
  },
  argTypes: {
    as: asArgType,
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

export const ListOfCards: Story = {
  render: (args) => (
    <Grid as="ul" columns={3} aria-label="Projetos">
      {['Biblioteca de componentes', 'Painel de métricas', 'Loja de exemplo'].map((label) => (
        <Card key={label} {...args} as="li">
          {label}
        </Card>
      ))}
    </Grid>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Uma lista de verdade: o `Grid` é um `ul` e cada `Card` é um `li`, sem `role` na mão. Como o `li` é item da grade, ele estica até a altura da linha sem `block-size: 100%`.'
      }
    }
  }
}
