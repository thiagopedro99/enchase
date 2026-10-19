import { useState } from 'react'
import { RadioGroup } from 'enchase'
import { defaultOrientation, plans, plansWithLockedTeam } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const ControlledDemo = () => {
  const [plan, setPlan] = useState('pro')

  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
      <RadioGroup label="Plano" options={plans} value={plan} onValueChange={setPlan} />
      <div style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>Valor escolhido: {plan}</div>
    </div>
  )
}

const meta = {
  title: 'Componentes/RadioGroup',
  component: RadioGroup,
  args: {
    label: 'Plano',
    options: plans,
    orientation: defaultOrientation,
    disabled: false,
    required: false
  },
  parameters: {
    docs: {
      description: {
        component:
          'Grupo de botões de opção para escolher uma entre poucas alternativas que cabem na tela de uma vez; para muitas, use o `Select`. Monta um `<fieldset>` com `role="radiogroup"`, título, texto de ajuda e mensagem de erro, como os outros campos. Cada opção é um `<input type="radio">` nativo de mesmo `name`, então o teclado já funciona: Tab entra no grupo e as setas movem e marcam a opção. Aceita `ref`, que vai para o `<fieldset>`, e os atributos dele; `className` e `style` também vão para ele.'
      }
    }
  },
  argTypes: {
    options: {
      description: 'Opções do grupo, cada uma com `value`, `label` e, se quiser, `disabled`. A ordem do array é a ordem na tela.',
      control: 'object'
    },
    label: {
      description: 'Título do grupo, desenhado como a `<legend>` do `<fieldset>`. Sem título visível, passe aria-label ao grupo.',
      control: 'text'
    },
    name: {
      description: 'Nome do campo no formulário, igual para todas as opções. Sem ele, o grupo usa um nome gerado, que mantém as opções ligadas entre si e separa um grupo do outro.',
      control: 'text'
    },
    value: {
      description: 'Valor da opção marcada quando o grupo é controlado. Exige também onValueChange. Para controlar sem nenhuma marcada, passe uma string vazia. Veja a story Controlled.',
      control: false
    },
    defaultValue: {
      description: 'Valor da opção marcada no início, para uso sem controle externo. Veja a story WithDefaultValue.',
      control: 'text'
    },
    onValueChange: {
      description: 'Chamada com o valor da opção que o usuário acabou de marcar, por clique ou pelas setas do teclado.',
      control: false
    },
    required: {
      description: 'Exige uma opção marcada ao enviar o formulário e avisa leitores de tela com aria-required.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    error: {
      description: 'Mensagem de erro. Marca o grupo como inválido (aria-invalid), pinta o título e as opções de vermelho e é anunciada como alerta. Substitui o helperText.',
      control: 'text'
    },
    helperText: {
      description: 'Texto de ajuda sob o grupo. Fica ligado a ele por aria-describedby e some quando há erro.',
      control: 'text'
    },
    orientation: {
      description: 'Direção da lista: vertical empilha as opções e horizontal as põe lado a lado, quebrando a linha quando falta espaço.',
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      table: { defaultValue: { summary: `'${defaultOrientation}'` } }
    },
    disabled: {
      description: 'Desativa todas as opções do grupo.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    animation: {
      description: 'Animação do ponto de marcado, que cresce com um pop curto. false desliga; { tuning: { duration, scale } } ajusta a duração em segundos e a escala inicial.',
      control: false,
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'pop' } }
    }
  }
} satisfies Meta<typeof RadioGroup>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithDefaultValue: Story = {
  args: { defaultValue: 'pro' }
}

export const Horizontal: Story = {
  args: { orientation: 'horizontal', options: plans.slice(0, 2), defaultValue: 'free' }
}

export const WithHelperText: Story = {
  args: { helperText: 'Dá para trocar de plano quando quiser', defaultValue: 'free' }
}

export const WithError: Story = {
  args: { error: 'Escolha um plano para continuar', required: true }
}

export const DisabledOption: Story = {
  args: { options: plansWithLockedTeam, defaultValue: 'free' }
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'pro' }
}

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledDemo />
}
