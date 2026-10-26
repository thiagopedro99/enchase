import { Badge, Flex } from 'enchase'
import { asArgType } from '@docs/shared/argTypes.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Flex',
  component: Flex,
  args: {
    direction: 'row',
    align: 'center',
    justify: 'start',
    gap: '1rem',
    wrap: false,
    children: ['Um', 'Dois', 'Três'].map((label) => <span key={label}>{label}</span>)
  },
  parameters: {
    docs: {
      description: {
        component: 'Contêiner flexbox configurado por props: direção, alinhamento, distribuição, espaço entre os filhos e quebra de linha. Em RTL, `row` começa pelo lado direito. Com `as="ul"`, vira uma lista de verdade, como uma fileira de etiquetas.'
      }
    }
  },
  argTypes: {
    as: asArgType,
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

export const BadgeList: Story = {
  args: { as: 'ul', wrap: true, gap: '0.5rem', 'aria-label': 'Tecnologias' },
  render: (args) => (
    <Flex {...args}>
      {['React', 'TypeScript', 'Vite', 'CSS Modules', 'Storybook'].map((label) => (
        <li key={label}>
          <Badge variant="primary">{label}</Badge>
        </li>
      ))}
    </Flex>
  ),
  parameters: { docs: { description: { story: 'Uma lista de etiquetas sem componente novo: `Flex as="ul"` com `wrap` e um `Badge` dentro de cada `li`. A lista é lida como lista (cinco itens) e quebra de linha quando não cabe.' } } }
}
