import { useState } from 'react'
import { Pagination } from 'enchase'
import { defaultBoundaryCount, defaultPage, defaultSiblingCount, defaultSize } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const ControlledDemo = () => {
  const [page, setPage] = useState(7)

  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
      <Pagination ariaLabel="Resultados" pageCount={24} page={page} onPageChange={setPage} />
      <div style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>Página {page} de 24</div>
    </div>
  )
}

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  args: {
    pageCount: 20,
    ariaLabel: 'Resultados',
    siblingCount: defaultSiblingCount,
    boundaryCount: defaultBoundaryCount,
    size: defaultSize
  },
  parameters: {
    docs: {
      description: {
        component:
          'Navegação entre as páginas de uma lista ou tabela: botões numerados, anterior e próxima, com reticências quando a lista é longa. É uma `<nav>` com uma lista de botões, e a página atual leva `aria-current="page"`. Anterior e próxima ficam indisponíveis (`aria-disabled`) nas pontas, sem tirar o foco de quem acabou de clicar. Os textos para leitores de tela vêm de `labels.pagination`, `labels.previousPage` e `labels.nextPage` do `UIProvider`. Aceita `ref`, que vai para a `<nav>`, e os atributos dela.'
      }
    }
  },
  argTypes: {
    pageCount: {
      description: 'Total de páginas. Com menos de 1, o componente não mostra nada.',
      control: 'number'
    },
    page: {
      description: 'Página atual quando o componente é controlado; a primeira é 1. Exige também onPageChange. Fora do intervalo, vale a primeira ou a última. Veja a story Controlled.',
      control: false
    },
    defaultPage: {
      description: 'Página inicial, para uso sem controle externo.',
      control: 'number',
      table: { defaultValue: { summary: String(defaultPage) } }
    },
    onPageChange: {
      description: 'Chamada com o número da página que o usuário escolheu, pelos números ou por anterior e próxima.',
      control: false
    },
    siblingCount: {
      description: 'Quantas páginas aparecem de cada lado da atual antes das reticências.',
      control: 'number',
      table: { defaultValue: { summary: String(defaultSiblingCount) } }
    },
    boundaryCount: {
      description: 'Quantas páginas ficam sempre visíveis no começo e no fim da lista.',
      control: 'number',
      table: { defaultValue: { summary: String(defaultBoundaryCount) } }
    },
    size: {
      description: 'Tamanho dos botões: sm tem 2 rem de lado e md, 2,5 rem.',
      control: 'inline-radio',
      options: ['sm', 'md'],
      table: { defaultValue: { summary: `'${defaultSize}'` } }
    },
    ariaLabel: {
      description: 'Nome da navegação para leitores de tela. Sem ele, vale labels.pagination do UIProvider.',
      control: 'text'
    },
    animation: {
      description: 'Animação do realce dos botões ao passar o mouse e ao pressionar. false desliga; { tuning: { duration } } ajusta a duração em segundos.',
      control: false,
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'fade' } }
    }
  }
} satisfies Meta<typeof Pagination>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Small: Story = {
  args: { size: 'sm' }
}

export const FewPages: Story = {
  args: { pageCount: 5 }
}

export const MoreNeighbors: Story = {
  args: { pageCount: 60, defaultPage: 30, siblingCount: 2, boundaryCount: 2 }
}

export const SinglePage: Story = {
  args: { pageCount: 1 }
}

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledDemo />
}
