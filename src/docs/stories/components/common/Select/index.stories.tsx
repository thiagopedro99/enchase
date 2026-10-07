import { defaultFullWidth } from '@components/common/Select/defaultData.ts'
import { Select } from '@components/common/Select/index.tsx'
import { countryOptions } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Componentes/Select',
  component: Select,
  args: {
    label: 'País',
    placeholder: 'Selecione...',
    options: countryOptions,
    defaultValue: '',
    $fullWidth: defaultFullWidth,
    disabled: false
  },
  argTypes: {
    label: {
      description: 'Rótulo do campo, associado ao select para leitores de tela.',
      control: 'text'
    },
    options: {
      description: 'Lista de opções. Cada uma tem value, label e, se quiser, disabled.',
      control: 'object',
      table: { type: { summary: 'SelectOption[]' } }
    },
    placeholder: {
      description: 'Texto da opção inicial, exibido enquanto nada foi escolhido. Para aparecer, o campo precisa começar com defaultValue vazio.',
      control: 'text'
    },
    helperText: {
      description: 'Texto de ajuda. Fica ligado ao campo por aria-describedby e some quando há erro.',
      control: 'text'
    },
    error: {
      description: 'Mensagem de erro. Marca o campo como inválido (aria-invalid) e é anunciada como alerta.',
      control: 'text'
    },
    $fullWidth: {
      description: 'Ocupa toda a largura disponível.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultFullWidth) } }
    },
    disabled: {
      description: 'Desativa o campo.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    defaultValue: {
      description: 'Valor inicial quando o campo não é controlado. Use vazio para mostrar o placeholder.',
      control: false
    },
    value: {
      description: 'Valor atual quando o campo é controlado. Exige também onChange.',
      control: false
    }
  }
} satisfies Meta<typeof Select>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithHelperText: Story = {
  args: { helperText: 'Usado para definir o idioma padrão' }
}

export const WithError: Story = {
  args: { error: 'Selecione um país' }
}

export const Disabled: Story = {
  args: { disabled: true }
}
