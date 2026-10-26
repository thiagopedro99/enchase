import { Button, Icon } from 'enchase'
import { CloseIcon } from 'enchase/icons'
import * as icons from 'enchase/icons'

import type { Meta, StoryObj } from '@storybook/react-vite'

const iconsRecipe = [
  'Contêiner SVG de 24x24, com traço de 2 px e a cor do texto (`currentColor`). Use-o para desenhar os seus ícones a partir de caminhos SVG.',
  '',
  'Os ícones que os componentes usam por dentro (menu, fechar, setas, mais, menos, olho, sol e lua, entre outros) saem prontos de `enchase/icons`, um componente por ícone, na story Gallery. Não é uma biblioteca de ícones: só tem o que algum componente usa. Para os demais, use uma biblioteca de ícones direto, sem o `Icon`. Qualquer nó React serve onde há conteúdo ou uma prop `icon`:',
  '',
  '```tsx',
  "import { Rocket } from 'lucide-react'",
  "import { Button } from 'enchase'",
  "import { CheckIcon } from 'enchase/icons'",
  '',
  '<Button variant="primary">',
  '  <CheckIcon size={18} />',
  '  Confirmar',
  '</Button>',
  '',
  '<Button variant="outline">',
  '  <Rocket size={18} aria-hidden="true" />',
  '  Começar',
  '</Button>',
  '```'
].join('\n')

const meta = {
  title: 'Components/Icon',
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
      description: { component: iconsRecipe }
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

export const Gallery: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'Os ícones de `enchase/icons`. Cada um aceita `size`, `title` e os atributos de um `<svg>`; sem `title` é decorativo. Os que apontam para um lado espelham em RTL sozinhos.' } }
  },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', maxInlineSize: '48rem' }}>
      {Object.entries(icons).map(([name, Component]) => (
        <div key={name} style={{ display: 'grid', justifyItems: 'center', alignContent: 'start', gap: '0.5rem', inlineSize: '10rem', padding: '1rem', border: '1px solid var(--enchase-color-border)', borderRadius: 'var(--enchase-radius-md)' }}>
          <Component size={28} />
          <span style={{ fontSize: '0.75rem', color: 'var(--enchase-color-text-secondary)', textAlign: 'center', overflowWrap: 'anywhere' }}>{name}</span>
        </div>
      ))}
    </div>
  )
}

export const IconOnlyButton: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'Um botão só com ícone precisa de `aria-label`: o ícone é decorativo e o botão ganha o nome dele.' } }
  },
  render: () => (
    <Button variant="ghost" aria-label="Fechar">
      <CloseIcon />
    </Button>
  )
}
