import { useState } from 'react'
import { Badge, Pagination, Table } from 'enchase'
import { defaultSize, defaultStriped, orders, pageSize, statusLabels, statusVariants } from './defaultData.ts'

import type { TableColumn } from 'enchase'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Order } from './defaultData.ts'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const columns: TableColumn<Order>[] = [
  { key: 'id', header: 'Pedido', rowHeader: true },
  { key: 'customer', header: 'Cliente' },
  {
    key: 'status',
    header: 'Situação',
    cell: (row) => (
      <Badge variant={statusVariants[row.status]} size="sm">
        {statusLabels[row.status]}
      </Badge>
    )
  },
  { key: 'date', header: 'Data' },
  { key: 'total', header: 'Total', align: 'end', cell: (row) => currency.format(row.total) }
]

const PaginatedDemo = () => {
  const [page, setPage] = useState(1)
  const first = (page - 1) * pageSize

  return (
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(48rem, 100%)' }}>
      <Table caption="Pedidos" columns={columns} rows={orders.slice(first, first + pageSize)} getRowKey={(row) => row.id} />
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>
          Mostrando {first + 1} a {Math.min(first + pageSize, orders.length)} de {orders.length}
        </div>
        <Pagination ariaLabel="Páginas de pedidos" pageCount={Math.ceil(orders.length / pageSize)} page={page} onPageChange={setPage} size="sm" />
      </div>
    </div>
  )
}

const meta = {
  title: 'Components/Table',
  component: Table<Order>,
  args: {
    caption: 'Pedidos recentes',
    columns,
    rows: orders.slice(0, 6),
    size: defaultSize,
    striped: defaultStriped
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Tabela de dados semântica, montada a partir de `columns` e `rows`: uma `<table>` com legenda (`<caption>`), cabeçalhos de coluna (`scope="col"`), cabeçalhos de linha opcionais e células que aceitam qualquer conteúdo pela função `cell`. É genérica: o tipo da linha passa das `rows` para as colunas. Quando a tabela é mais larga que o espaço, o contêiner rola na horizontal e vira uma região focável com o nome da tabela, para quem usa só o teclado. Não ordena nem pagina: ordene os dados antes e use a `Pagination` ao lado. Aceita `ref`, que vai para o contêiner, e os atributos do `<div>`; `className` e `style` também vão para ele.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: 'min(48rem, 100%)' }}>
        <Story />
      </div>
    )
  ],
  argTypes: {
    columns: {
      description:
        'Colunas da tabela, na ordem da tela. Cada uma tem `key` (o campo da linha que ela mostra), `header` (texto do cabeçalho) e, se quiser, `cell` (função que devolve o conteúdo da célula de uma linha), `align` (`start`, `center` ou `end`), `width` (largura CSS, como `8rem`) e `rowHeader` (as células dela viram cabeçalhos de linha). Sem `cell`, a coluna mostra `row[key]` como texto.',
      control: false
    },
    rows: {
      description: 'Linhas da tabela, um objeto por linha. O tipo das linhas liga as colunas a elas: `TableColumn<Pedido>[]` com `rows` de `Pedido`.',
      control: false
    },
    getRowKey: {
      description: 'Devolve a chave estável de uma linha, como o id, para o React reaproveitar a linha quando a ordem muda. Sem ela, vale a posição.',
      control: false
    },
    caption: {
      description: 'Título da tabela, escrito como `<caption>` acima dela, que também dá o nome acessível. Para um nome que não aparece, passe ariaLabel.',
      control: 'text'
    },
    ariaLabel: {
      description: 'Nome da tabela para leitores de tela, útil quando não há legenda. Com as duas, vale ariaLabel.',
      control: 'text'
    },
    empty: {
      description: 'Conteúdo mostrado em uma célula que ocupa todas as colunas quando não há linhas. Sem ele, só o cabeçalho aparece.',
      control: 'text'
    },
    size: {
      description: 'Densidade das linhas: sm é compacta e md é a padrão.',
      control: 'inline-radio',
      options: ['sm', 'md'],
      table: { defaultValue: { summary: `'${defaultSize}'` } }
    },
    striped: {
      description: 'Alterna o fundo das linhas para ajudar a seguir uma linha comprida.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultStriped) } }
    }
  }
} satisfies Meta<typeof Table<Order>>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Striped: Story = {
  args: { striped: true }
}

export const Small: Story = {
  args: { size: 'sm' }
}

export const WithoutCaption: Story = {
  args: { caption: undefined, ariaLabel: 'Pedidos recentes' }
}

export const Empty: Story = {
  args: { rows: [], empty: 'Nenhum pedido ainda' }
}

export const Scrolls: Story = {
  args: { striped: true },
  render: (args) => (
    <div style={{ inlineSize: 'min(24rem, 100%)' }}>
      <Table {...args} />
    </div>
  )
}

export const WithPagination: Story = {
  parameters: { controls: { disable: true } },
  render: () => <PaginatedDemo />
}
