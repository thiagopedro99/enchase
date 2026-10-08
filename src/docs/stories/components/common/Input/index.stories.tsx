import { defaultFullWidth, defaultPasswordToggle } from '@components/common/Input/defaultData.ts'
import { Input } from '@components/common/Input/index.tsx'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Componentes/Input',
  component: Input,
  args: {
    label: 'Email',
    placeholder: 'seu@email.com',
    type: 'text',
    fullWidth: defaultFullWidth,
    disabled: false
  },
  argTypes: {
    label: {
      description: 'Rótulo do campo, associado ao input para leitores de tela.',
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
    fullWidth: {
      description: 'Ocupa toda a largura disponível.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultFullWidth) } }
    },
    passwordToggle: {
      description: 'Mostra o botão para revelar ou ocultar a senha. Só vale quando type é password. Os textos do botão vêm do UIProvider.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultPasswordToggle) } }
    },
    type: {
      description: 'Tipo nativo do input.',
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
      table: { defaultValue: { summary: 'text' } }
    },
    placeholder: {
      description: 'Texto de exemplo exibido quando o campo está vazio.',
      control: 'text'
    },
    disabled: {
      description: 'Desativa o campo.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    }
  }
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithHelperText: Story = {
  args: { helperText: 'Nunca compartilharemos seu email' }
}

export const WithError: Story = {
  args: { error: 'Este campo é obrigatório' }
}

export const Password: Story = {
  args: { label: 'Senha', type: 'password', placeholder: undefined, helperText: 'Use o olho para conferir o que digitou' }
}

export const Disabled: Story = {
  args: { disabled: true }
}
