import { Badge, Button } from 'enchase'
import { defaultSize, defaultVariant, variantLabels, variants } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: {
    children: 'Novo',
    variant: defaultVariant,
    size: defaultSize
  },
  parameters: {
    docs: {
      description: {
        component: 'Etiqueta pequena para um estado ou uma contagem, como "Novo", "Pago" ou "3". A cor vem de pares de papéis do tema, com o contraste conferido, e o texto sempre carrega o significado: nunca dependa só da cor. É um `<span>` e aceita os atributos dele.'
      }
    }
  },
  argTypes: {
    children: {
      description: 'Conteúdo da etiqueta: um texto curto, um número ou um ícone ao lado do texto.',
      control: 'text'
    },
    variant: {
      description: 'Cor da etiqueta, por papel do tema: neutral é cinza, primary usa a cor principal e success, warning, error e info seguem os estados.',
      control: 'select',
      options: variants,
      table: { defaultValue: { summary: `'${defaultVariant}'` } }
    },
    size: {
      description: 'Tamanho da etiqueta: sm tem 20 px de altura e md, 24 px.',
      control: 'inline-radio',
      options: ['sm', 'md'],
      table: { defaultValue: { summary: `'${defaultSize}'` } }
    }
  }
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
      {variants.map((variant) => (
        <Badge key={variant} {...args} variant={variant}>
          {variantLabels[variant]}
        </Badge>
      ))}
    </div>
  )
}

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
      <Badge {...args} size="sm">
        Pequeno
      </Badge>
      <Badge {...args} size="md">
        Médio
      </Badge>
    </div>
  )
}

export const WithAButton: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Button variant="outline">
      Caixa de entrada <Badge variant="primary">3</Badge>
    </Button>
  )
}
