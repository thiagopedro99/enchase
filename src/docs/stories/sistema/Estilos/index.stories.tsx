import { Preview } from './Preview.tsx'
import { defaultStyle, placementLabels, placements, shapeLabels, shapes, styles } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { StyleStoryArgs } from './types.ts'

const meta = {
  title: 'Sistema/Estilos',
  tags: ['!autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'O `style` do `createTheme` (e da prop `theme` do `ColorModeProvider`) troca o visual do kit inteiro: a paleta, os raios, as alturas, os pesos, as bordas, as sombras e o lugar do rótulo dos campos. Cada estilo é um objeto que se importa de `enchase/styles` (`import { shadcn } from \'enchase/styles\'`) e se passa em `createTheme({ style: shadcn })`: só quem importa um estilo leva os dados dele. `enchase` é o visual de sempre; `shadcn` aproxima o kit do shadcn/ui, sem abrir mão do contraste da biblioteca. O que você passa em `brand`, `shape`, `radius`, `fonts`, `motion`, `light` e `dark` vence o estilo. A barra de ferramentas do Storybook, em Estilo, troca o estilo de todas as stories.'
      }
    }
  },
  args: { style: defaultStyle, brand: '', shape: '', labelPlacement: '' },
  argTypes: {
    style: {
      description: 'Estilo visual, importado de enchase/styles e passado em createTheme({ style }): enchase (o visual padrão, sem sobrescritas) ou shadcn (paleta neutra, bordas no lugar de sombras, controles de 36px, cantos de 0.5rem, rótulo acima do campo).',
      control: 'inline-radio',
      options: styles
    },
    brand: {
      description: 'Cor da marca (createTheme({ brand })), por cima do estilo. Vazio usa a do estilo. Com o shadcn, só o acento muda: os neutros ficam. Aceita hex ou rgb().',
      control: 'text'
    },
    shape: {
      description: 'Forma dos cantos (createTheme({ shape })), por cima do estilo. Vazio usa os raios do estilo.',
      control: { type: 'inline-radio', labels: shapeLabels },
      options: shapes
    },
    labelPlacement: {
      description: 'Onde fica o rótulo dos campos (prop labelPlacement do Input, do NumberInput, do Select e do Textarea), por cima do estilo. Vazio usa o do estilo: floating no enchase e stacked no shadcn.',
      control: { type: 'inline-radio', labels: placementLabels },
      options: placements
    }
  },
  render: (args) => <Preview {...args} />
} satisfies Meta<StyleStoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Shadcn: Story = {
  args: { style: 'shadcn' }
}

export const ShadcnComMarca: Story = {
  args: { style: 'shadcn', brand: '#0b6bcb' }
}

export const ShadcnComBotoesEmPilula: Story = {
  args: { style: 'shadcn', shape: 'pill' }
}

export const RotuloEmCima: Story = {
  args: { style: 'enchase', labelPlacement: 'stacked' }
}
