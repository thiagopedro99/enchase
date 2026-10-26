import { useState } from 'react'
import { Switch } from 'enchase'
import { settings } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const ControlledDemo = () => {
  const [enabled, setEnabled] = useState(false)

  return (
    <div style={{ display: 'grid', gap: '0.5rem', justifyItems: 'start' }}>
      <Switch label="Receber notificações" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
      <div style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>{enabled ? 'Notificações ligadas' : 'Notificações desligadas'}</div>
    </div>
  )
}

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    label: 'Receber notificações',
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        component: 'Interruptor de liga e desliga para uma configuração que vale na hora, com rótulo clicável. É um `<input type="checkbox">` com `role="switch"`, então leitores de tela o anunciam como interruptor e o formulário envia o valor só quando ligado. Aceita `ref` e os atributos do `<input>`. Para uma escolha que só vale ao enviar o formulário, prefira o `Checkbox`.'
      }
    }
  },
  argTypes: {
    label: {
      description: 'Texto do rótulo. Clicar nele também liga e desliga. Sem rótulo visível, passe aria-label.',
      control: 'text'
    },
    disabled: {
      description: 'Desativa o interruptor e bloqueia a troca.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    defaultChecked: {
      description: 'Estado inicial ligado, para uso sem controle externo. Veja a story Checked.',
      control: false
    },
    checked: {
      description: 'Estado ligado quando o componente é controlado. Exige também onChange. Veja a story Controlled.',
      control: false
    },
    wrapperClassName: {
      description: 'Classe da raiz (data-slot="switch"). className continua no input nativo (data-slot="switch-input").',
      control: 'text'
    },
    wrapperStyle: {
      description: 'Estilo da raiz (data-slot="switch"). style continua no input nativo.',
      control: false
    },
    animation: {
      description: 'Animação da troca: a bolinha desliza e a trilha muda de cor. false desliga; { tuning: { duration } } ajusta a duração em segundos.',
      control: false,
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'fade' } }
    }
  }
} satisfies Meta<typeof Switch>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Checked: Story = {
  args: { defaultChecked: true }
}

export const Disabled: Story = {
  args: { disabled: true }
}

export const DisabledChecked: Story = {
  args: { disabled: true, defaultChecked: true }
}

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledDemo />
}

export const WithoutLabel: Story = {
  args: { label: undefined, 'aria-label': 'Modo escuro' }
}

export const Preferences: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: 'grid', gap: '0.25rem' }}>
      {settings.map(({ id, label, hint, checked }) => (
        <div key={id}>
          <Switch label={label} defaultChecked={checked} aria-describedby={`${id}-hint`} />
          <div id={`${id}-hint`} style={{ marginInlineStart: 'calc(3.25rem + var(--enchase-space-md))', fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>
            {hint}
          </div>
        </div>
      ))}
    </div>
  )
}
