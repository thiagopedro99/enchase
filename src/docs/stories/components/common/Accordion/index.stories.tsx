import { useState } from 'react'
import { Accordion, Button } from 'enchase'
import { defaultHeadingLevel, defaultMultiple, faq } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const items = faq.map(({ value, title, text }) => ({ value, title, content: <p style={{ margin: 0 }}>{text}</p> }))

const ControlledDemo = () => {
  const [open, setOpen] = useState<string[]>(['returns'])

  return (
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(36rem, 100%)' }}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button size="sm" variant="outline" onClick={() => setOpen(faq.map(({ value }) => value))}>
          Abrir todos
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen([])}>
          Fechar todos
        </Button>
      </div>
      <Accordion multiple items={items} value={open} onValueChange={setOpen} />
    </div>
  )
}

const meta = {
  title: 'Componentes/Accordion',
  component: Accordion,
  args: {
    items,
    multiple: defaultMultiple,
    headingLevel: defaultHeadingLevel
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Lista de itens que abrem e fecham para mostrar um conteúdo por vez, ou vários com `multiple`, como em perguntas frequentes. Segue o padrão ARIA de acordeão: cada item é um botão com `aria-expanded` dentro de um título (`<h3>` por padrão), e o painel é uma região ligada ao botão. Tab percorre os botões, Enter e Espaço abrem e fecham, e as setas, Home e End movem o foco. Os painéis fechados ficam no documento, então o estado do conteúdo se mantém. Aceita `ref`, que vai para a raiz, e os atributos do `<div>`.'
      }
    }
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: 'min(36rem, 100%)' }}>
        <Story />
      </div>
    )
  ],
  argTypes: {
    items: {
      description:
        'Itens do acordeão, na ordem da tela. Cada item tem `value` (único), `title` (texto do botão), `content` (conteúdo do painel) e, se quiser, `disabled`. Os painéis fechados ficam no documento, então o estado do conteúdo se mantém.',
      control: false
    },
    multiple: {
      description: 'Deixa vários itens abertos ao mesmo tempo. Sem ela, abrir um item fecha o que estava aberto, e o item aberto ainda pode ser fechado de novo.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultMultiple) } }
    },
    value: {
      description: 'Valores dos itens abertos quando o componente é controlado, em uma lista. Exige também onValueChange. Veja a story Controlled.',
      control: false
    },
    defaultValue: {
      description: 'Valores dos itens abertos no início, em uma lista, para uso sem controle externo. Sem multiple, vale só o primeiro.',
      control: 'object'
    },
    onValueChange: {
      description: 'Chamada com a lista dos itens abertos depois de cada clique.',
      control: false
    },
    headingLevel: {
      description: 'Nível do título, de h2 a h6, que envolve o botão de cada item. Escolha o nível que continua a hierarquia de títulos da página.',
      control: 'inline-radio',
      options: [2, 3, 4, 5, 6],
      table: { defaultValue: { summary: String(defaultHeadingLevel) } }
    },
    animation: {
      description: 'Animação do painel, que aparece com um fade e um pequeno deslize, e da seta, que gira. A altura não anima. false desliga; { tuning: { duration, distance } } ajusta a duração em segundos e o deslize em pixels.',
      control: false,
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'pop' } }
    }
  }
} satisfies Meta<typeof Accordion>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithDefaultValue: Story = {
  args: { defaultValue: ['returns'] }
}

export const Multiple: Story = {
  args: { multiple: true, defaultValue: ['shipping', 'payment'] }
}

export const DisabledItem: Story = {
  args: { items: items.map((item) => (item.value === 'payment' ? { ...item, disabled: true } : item)) }
}

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledDemo />
}
