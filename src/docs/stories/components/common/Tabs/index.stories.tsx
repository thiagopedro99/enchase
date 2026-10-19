import { useState } from 'react'
import { Button, Input, Tabs } from 'enchase'
import { defaultActivation, manySections, sections } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const items = sections.map(({ value, label, text }) => ({ value, label, content: <p style={{ margin: 0 }}>{text}</p> }))

const ControlledDemo = () => {
  const [tab, setTab] = useState('billing')

  return (
    <div style={{ display: 'grid', gap: '1rem', inlineSize: 'min(32rem, 100%)' }}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {sections.map(({ value, label }) => (
          <Button key={value} size="sm" variant={tab === value ? 'primary' : 'outline'} onClick={() => setTab(value)}>
            {label}
          </Button>
        ))}
      </div>
      <Tabs ariaLabel="Seções da conta" items={items} value={tab} onValueChange={setTab} />
    </div>
  )
}

const meta = {
  title: 'Componentes/Tabs',
  component: Tabs,
  args: {
    ariaLabel: 'Seções da conta',
    items,
    activation: defaultActivation
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Abas para dividir um conteúdo em painéis e mostrar um por vez. Seguem o padrão ARIA de abas: `role="tablist"`, uma única parada do Tab na aba escolhida, setas, Home e End para navegar e cada painel ligado à sua aba. Um indicador desliza até a aba escolhida, e a lista rola na horizontal quando as abas não cabem. As abas são horizontais. Aceita `ref`, que vai para a raiz, e os atributos do `<div>`.'
      }
    }
  },
  argTypes: {
    items: {
      description:
        'Abas da lista, na ordem da tela. Cada item tem `value` (único), `label` (texto da aba), `content` (conteúdo do painel) e, se quiser, `disabled`. Todos os painéis ficam no documento e só o da aba escolhida aparece, então o estado dos outros se mantém.',
      control: false
    },
    value: {
      description: 'Valor da aba escolhida quando o componente é controlado. Exige também onValueChange. Veja a story Controlled.',
      control: false
    },
    defaultValue: {
      description: 'Valor da aba escolhida no início, para uso sem controle externo. Sem ele, vale a primeira aba que não está desativada.',
      control: 'text'
    },
    onValueChange: {
      description: 'Chamada com o valor da aba que o usuário acabou de escolher, por clique ou pelo teclado.',
      control: false
    },
    activation: {
      description: 'Quando a aba focada pelas setas passa a valer: automatic escolhe a aba ao focá-la e manual só move o foco, e Enter ou Espaço escolhe. Prefira manual quando o painel demora a carregar.',
      control: 'inline-radio',
      options: ['automatic', 'manual'],
      table: { defaultValue: { summary: `'${defaultActivation}'` } }
    },
    ariaLabel: {
      description: 'Nome da lista de abas para leitores de tela. Não aparece na tela: descreva o que as abas organizam, como Seções da conta.',
      control: 'text'
    },
    animation: {
      description: 'Animação do indicador, que desliza até a aba escolhida, e do painel, que aparece com um fade. false desliga; { tuning: { duration } } ajusta a duração em segundos.',
      control: false,
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'fade' } }
    }
  }
} satisfies Meta<typeof Tabs>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithDefaultValue: Story = {
  args: { defaultValue: 'team' }
}

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledDemo />
}

export const ManualActivation: Story = {
  args: { activation: 'manual' }
}

export const DisabledTab: Story = {
  args: { items: items.map((item) => (item.value === 'billing' ? { ...item, disabled: true } : item)) }
}

export const ManyTabs: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ inlineSize: 'min(24rem, 100%)' }}>
      <Tabs ariaLabel="Áreas do painel" items={manySections.map((label) => ({ value: label, label, content: <p style={{ margin: 0 }}>Conteúdo de {label}.</p> }))} />
    </div>
  )
}

export const KeepsState: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ inlineSize: 'min(28rem, 100%)' }}>
      <Tabs
        ariaLabel="Cadastro"
        items={[
          { value: 'form', label: 'Formulário', content: <Input label="Nome" /> },
          { value: 'help', label: 'Ajuda', content: <p style={{ margin: 0 }}>Escreva algo no formulário, troque de aba e volte: o texto continua lá.</p> }
        ]}
      />
    </div>
  )
}
