import { Flex } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Componentes/Flex',
  component: Flex,
  args: {
    direction: 'row',
    align: 'center',
    justify: 'start',
    gap: '1rem',
    wrap: false,
    children: ['Um', 'Dois', 'Três'].map((label) => <span key={label}>{label}</span>)
  },
  argTypes: {
    direction: { control: 'inline-radio', options: ['row', 'column', 'row-reverse', 'column-reverse'], description: 'Eixo principal. Em RTL, row começa pelo lado direito.' },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch', 'baseline'], description: 'Alinhamento no eixo cruzado.' },
    justify: { control: 'select', options: ['start', 'center', 'end', 'between', 'around', 'evenly'], description: 'Distribuição no eixo principal.' },
    gap: { control: 'text', description: 'Espaço entre os filhos, passado por variável CSS. O padrão vem do token de espaçamento.' },
    wrap: { control: 'boolean', description: 'Permite quebrar linha.', table: { defaultValue: { summary: 'false' } } }
  }
} satisfies Meta<typeof Flex>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Column: Story = {
  args: { direction: 'column', align: 'start' }
}
