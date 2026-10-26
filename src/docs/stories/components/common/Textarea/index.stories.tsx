import { Textarea } from 'enchase'
import { defaultFullWidth, defaultResize, defaultRows } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  args: {
    label: 'Mensagem',
    placeholder: 'Conte o que aconteceu',
    fullWidth: defaultFullWidth,
    resize: defaultResize,
    rows: defaultRows,
    disabled: false
  },
  parameters: {
    docs: {
      description: {
        component: 'Campo de texto de várias linhas, com rótulo, mensagem de erro e texto de ajuda, como o `Input`. Aceita `ref` e os atributos do `<textarea>`.'
      }
    }
  },
  argTypes: {
    label: {
      description: 'Rótulo do campo, associado ao textarea para leitores de tela.',
      control: 'text'
    },
    labelPlacement: {
      description: 'Onde fica o rótulo: floating (dentro do campo, sobe para o contorno ao focar ou preencher) ou stacked (acima do controle, sem entalhe no contorno). Sem a prop, vale o style do tema (createTheme): floating no padrão e stacked no shadcn.',
      control: 'inline-radio',
      options: ['floating', 'stacked'],
      table: { defaultValue: { summary: "'floating'" } }
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
    resize: {
      description: 'Como o usuário redimensiona o campo pela alça do canto: none não deixa, vertical muda só a altura, horizontal só a largura e both as duas.',
      control: 'inline-radio',
      options: ['none', 'vertical', 'horizontal', 'both'],
      table: { defaultValue: { summary: `'${defaultResize}'` } }
    },
    rows: {
      description: 'Número de linhas visíveis. O campo rola quando o texto passa disso.',
      control: 'number',
      table: { defaultValue: { summary: String(defaultRows) } }
    },
    placeholder: {
      description: 'Texto de exemplo exibido quando o campo está vazio. Com rótulo, ele só aparece com o foco.',
      control: 'text'
    },
    disabled: {
      description: 'Desativa o campo.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    wrapperClassName: {
      description: 'Classe da raiz (data-slot="textarea"). className e style continuam no textarea nativo (data-slot="textarea-field").',
      control: 'text'
    },
    wrapperStyle: {
      description: 'Estilo da raiz (data-slot="textarea"). style continua no textarea nativo.',
      control: false
    }
  }
} satisfies Meta<typeof Textarea>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithHelperText: Story = {
  args: { helperText: 'Quanto mais detalhes, mais rápido conseguimos ajudar' }
}

export const WithError: Story = {
  args: { error: 'Este campo é obrigatório' }
}

export const FixedSize: Story = {
  args: { resize: 'none', rows: 6 }
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: 'Este texto não pode ser editado' }
}

export const LabelAbove: Story = {
  args: { labelPlacement: 'stacked' }
}
