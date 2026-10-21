import { Select } from 'enchase'
import { countryOptions, defaultFullWidth } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Componentes/Select',
  component: Select,
  args: {
    label: 'País',
    placeholder: 'Selecione...',
    options: countryOptions,
    defaultValue: '',
    fullWidth: defaultFullWidth,
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        component: 'Seleção nativa estilizada, com rótulo, mensagem de erro, texto de ajuda e `placeholder`. Aceita `ref` e os atributos do `<select>`.'
      }
    }
  },
  argTypes: {
    label: {
      description: 'Rótulo do campo, associado ao select para leitores de tela.',
      control: 'text'
    },
    labelPlacement: {
      description: 'Onde fica o rótulo: floating (dentro do campo, sobe para o contorno ao focar ou preencher) ou stacked (acima do controle, sem entalhe no contorno). Sem a prop, vale o style do tema (createTheme): floating no padrão e stacked no shadcn.',
      control: 'inline-radio',
      options: ['floating', 'stacked'],
      table: { defaultValue: { summary: "'floating'" } }
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
    fullWidth: {
      description: 'Ocupa toda a largura disponível.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultFullWidth) } }
    },
    disabled: {
      description: 'Desativa o campo.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    wrapperClassName: {
      description: 'Classe da raiz (data-slot="select"). className e style continuam no select nativo (data-slot="select-field").',
      control: 'text'
    },
    wrapperStyle: {
      description: 'Estilo da raiz (data-slot="select"). style continua no select nativo.',
      control: false
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

export const LabelAbove: Story = {
  args: { labelPlacement: 'stacked' }
}
