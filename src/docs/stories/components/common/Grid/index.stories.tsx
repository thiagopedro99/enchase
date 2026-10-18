import { Grid } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const cell = (label: string) => (
  <div key={label} style={{ background: 'var(--enchase-color-surface-container)', padding: '1rem', borderRadius: 'var(--enchase-radius-md)' }}>
    {label}
  </div>
)

const cells = ['Um', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis'].map(cell)

const meta = {
  title: 'Componentes/Grid',
  component: Grid,
  args: {
    columns: 3,
    children: cells
  },
  parameters: {
    docs: {
      description: {
        component: 'Grade CSS que reduz as colunas sozinha quando elas não cabem, sem media query.'
      }
    }
  },
  argTypes: {
    columns: {
      description: 'Número de colunas em telas largas. Quando não cabem, o grid reduz as colunas sozinho, sem media query.',
      control: { type: 'number', min: 1, max: 6 },
      table: { defaultValue: { summary: '1' } }
    },
    minColumnWidth: {
      description: 'Largura mínima de cada coluna (qualquer valor CSS). Quando definida, vale no lugar de columns e o grid usa auto-fit.',
      control: 'text'
    },
    gap: {
      description: 'Espaço entre as células, por variável CSS. O padrão vem do token de espaçamento.',
      control: 'text'
    },
    className: { description: 'Classe da raiz (data-slot="grid").', control: 'text' },
    style: { control: false }
  }
} satisfies Meta<typeof Grid>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const FixedColumns: Story = {
  args: { columns: 2, gap: '2rem' }
}

export const MinimumColumnWidth: Story = {
  args: { columns: undefined, minColumnWidth: '12rem' }
}
