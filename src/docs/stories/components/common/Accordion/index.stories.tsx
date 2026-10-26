import { useState } from 'react'
import { Accordion, Badge, Button } from 'enchase'
import { defaultHeadingLevel, defaultMultiple, faq } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const items = faq.map(({ value, title, text }) => ({ value, title, content: <p style={{ margin: 0 }}>{text}</p> }))

const company = (name: string, current = false) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
    <span
      aria-hidden="true"
      style={{ display: 'inline-grid', placeItems: 'center', inlineSize: '2rem', blockSize: '2rem', fontWeight: 600, borderRadius: 'var(--enchase-radius-md)', color: 'var(--enchase-color-on-primary-container)', background: 'var(--enchase-color-primary-container)' }}
    >
      {name[0]}
    </span>
    <span>{name}</span>
    {current && (
      <Badge variant="success" size="sm">
        Atual
      </Badge>
    )}
  </span>
)

const experience = [
  { value: 'acme', title: company('Acme Ltda', true), content: <p style={{ margin: 0 }}>Desde 2023, na equipe de plataforma.</p> },
  { value: 'globex', title: company('Globex S.A.'), content: <p style={{ margin: 0 }}>De 2019 a 2022, no time de produto.</p> },
  { value: 'initech', title: company('Initech'), content: <p style={{ margin: 0 }}>De 2016 a 2019, como desenvolvedor.</p> }
]

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
  title: 'Components/Accordion',
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
        'Itens do acordeão, na ordem da tela. Cada item tem `value` (único), `title` (o conteúdo do botão: texto ou nós, como um logo, um `span` e um `Badge`), `content` (conteúdo do painel) e, se quiser, `disabled`. O `title` fica dentro de um `<button>`, então só cabem elementos de texto, sem outro botão, link ou campo, e tudo o que está nele entra no nome do botão e do painel. Os painéis fechados ficam no documento, então o estado do conteúdo se mantém.',
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

export const WithNodesInTitle: Story = {
  args: { items: experience, defaultValue: ['acme'] },
  parameters: {
    docs: {
      description: {
        story: 'O `title` aceita nós, não só texto: aqui o logo da empresa, o nome e um `Badge` ficam no botão, em vez de irem para o corpo do painel. Use elementos de texto (`span`, `Badge`, imagens): o título está dentro de um `<button>`. O nome do botão e do painel é o texto de tudo o que está nele, então o logo decorativo leva `aria-hidden` e as imagens, `alt=""`.'
      }
    }
  }
}
