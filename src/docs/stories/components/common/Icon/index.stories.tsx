import { Button, Icon } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const thirdPartyRecipe = [
  'Contêiner SVG de 24x24, com traço de 2 px e a cor do texto (`currentColor`). Use-o para desenhar os seus ícones a partir de caminhos SVG.',
  '',
  'A biblioteca não exporta um conjunto de ícones: os que os componentes usam por dentro (menu, fechar, setas, olho, sol e lua) são internos. Para ícones prontos, use uma biblioteca de ícones direto, sem o `Icon`. Qualquer nó React serve onde há conteúdo ou uma prop `icon`:',
  '',
  '```tsx',
  "import { Rocket } from 'lucide-react'",
  "import { Button } from 'enchase'",
  '',
  '<Button variant="primary">',
  '  <Rocket size={18} aria-hidden="true" />',
  '  Começar',
  '</Button>',
  '```'
].join('\n')

const meta = {
  title: 'Componentes/Icon',
  component: Icon,
  args: {
    children: <path d="M12 5v14M5 12h14" />
  },
  argTypes: {
    children: {
      description: 'Formas SVG (path, circle, rect, line) desenhadas em um viewBox de 24x24.',
      control: false
    },
    name: {
      description: 'Identificador opcional. Vira o atributo data-icon, útil para estilizar de fora ou nos testes.',
      control: 'text'
    },
    size: {
      description: 'Lado do ícone em pixels.',
      control: 'number',
      table: { defaultValue: { summary: '24' } }
    },
    title: {
      description: 'Nome acessível. Sem ele o ícone é decorativo (aria-hidden="true"); com ele vira role="img" e ganha um elemento title dentro do SVG.',
      control: 'text'
    },
    directional: {
      description: 'Espelha o ícone em RTL. Use em setas e chevrons.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    className: {
      description: 'Classe do elemento (data-slot="icon"), que vence o estilo da biblioteca.',
      control: 'text'
    },
    style: { control: false }
  },
  parameters: {
    docs: {
      description: { component: thirdPartyRecipe }
    }
  }
} satisfies Meta<typeof Icon>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithTitle: Story = {
  args: { name: 'plus', title: 'Adicionar', size: 32 }
}

export const Directional: Story = {
  args: { name: 'arrow-right', directional: true, children: <path d="M5 12h14M13 6l6 6-6 6" /> },
  parameters: { docs: { description: { story: 'Em uma página com dir="rtl" a seta aponta para a esquerda.' } } }
}

export const InsideAButton: Story = {
  render: () => (
    <Button variant="primary">
      <Icon size={18}>
        <path d="M20 6 9 17l-5-5" />
      </Icon>
      Confirmar
    </Button>
  )
}
