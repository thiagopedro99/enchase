import { Card, Grid } from 'enchase'
import { asArgType } from '@docs/shared/argTypes.ts'

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
    layout: 'padded',
    docs: {
      description: {
        component:
          'Grade CSS que reduz as colunas sozinha quando elas não cabem, sem media query. Com `columns` em objeto, o número de colunas muda nos breakpoints do `UIProvider`, em CSS puro e sem quadro errado antes da hidratação. Com `centerLastRow`, a última linha incompleta fica centralizada. Com `as`, a raiz vira outra tag de estrutura, como `ul` para uma lista de cartões.'
      }
    }
  },
  argTypes: {
    as: asArgType,
    columns: {
      description:
        'Um número, que é o máximo de colunas em telas largas: quando elas não cabem, o grid reduz sozinho, sem media query. Ou um objeto com o número de colunas a partir de cada breakpoint (`{ xs: 1, md: 2, lg: 4 }`): é mobile first, um breakpoint sem valor repete o menor que veio antes, e os valores dos breakpoints são os do `UIProvider`. Números vão para inteiros de pelo menos 1.',
      control: { type: 'number', min: 1, max: 6 },
      table: { defaultValue: { summary: '1' }, type: { summary: 'number | { xs?: number, sm?: number, md?: number, lg?: number, xl?: number, xxl?: number }' } }
    },
    minColumnWidth: {
      description: 'Largura mínima de cada coluna (qualquer valor CSS). Quando definida, vale no lugar de columns e o grid usa auto-fit.',
      control: 'text'
    },
    gap: {
      description: 'Espaço entre as células, por variável CSS. O padrão vem do token de espaçamento.',
      control: 'text'
    },
    centerLastRow: {
      description:
        'Centraliza a última linha quando ela fica incompleta, como os dois últimos cards de cinco em três colunas. O grid passa a ser uma linha flexível que quebra: cada célula tem a largura de uma coluna e as linhas cheias continuam alinhadas nas colunas. Vale com `columns` (número ou objeto) e é ignorado com `minColumnWidth`, porque o número de colunas então depende da largura.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
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

export const ResponsiveColumns: Story = {
  args: { columns: { xs: 1, sm: 2, lg: 4 }, children: ['Um', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis', 'Sete', 'Oito'].map(cell) },
  parameters: { docs: { description: { story: 'Uma coluna no celular, duas a partir de `sm` e quatro a partir de `lg`. Mude a largura do quadro (ou o viewport do Storybook) para ver as colunas trocarem nos breakpoints.' } } }
}

export const CenteredLastRow: Story = {
  args: { columns: 3, centerLastRow: true, children: ['Um', 'Dois', 'Três', 'Quatro', 'Cinco'].map(cell) },
  parameters: { docs: { description: { story: 'Cinco células em três colunas: as duas da última linha ficam centralizadas, e a primeira linha continua nas colunas.' } } }
}

export const CenteredAndResponsive: Story = {
  args: { columns: { xs: 2, lg: 4 }, centerLastRow: true, children: ['Um', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis', 'Sete'].map(cell) },
  parameters: { docs: { description: { story: 'As duas coisas juntas: a última linha de cada breakpoint fica centralizada (três células em quatro colunas, uma em duas).' } } }
}

export const AsList: Story = {
  args: {
    as: 'ul',
    columns: 3,
    'aria-label': 'Projetos',
    children: ['Um', 'Dois', 'Três', 'Quatro', 'Cinco', 'Seis'].map((label) => (
      <Card key={label} as="li">
        {label}
      </Card>
    ))
  },
  parameters: { docs: { description: { story: 'Com `as="ul"` o grid é uma lista: perde marcadores, margem e recuo e ganha `role="list"`, e cada `Card as="li"` é um item que estica até a altura da linha.' } } }
}
