import { useState } from 'react'
import { Badge, CardButton, Grid } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const skills = [
  ['React', 'Componentes e hooks'],
  ['TypeScript', 'Tipos de ponta a ponta'],
  ['CSS Modules', 'Estilo sem runtime'],
  ['Vite', 'Build rápido'],
  ['Storybook', 'Documentação viva'],
  ['Vitest', 'Testes de comportamento']
]

const content = (title: string, text: string) => (
  <>
    <span style={{ display: 'block', fontWeight: 600 }}>{title}</span>
    <span style={{ display: 'block', color: 'var(--enchase-color-text-secondary)' }}>{text}</span>
  </>
)

const SelectableSkills = () => {
  const [selected, setSelected] = useState('React')

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <Grid as="ul" columns={{ xs: 1, sm: 2, lg: 3 }} aria-label="Habilidades">
        {skills.map(([title, text]) => (
          <li key={title}>
            <CardButton variant={title === selected ? 'elevated' : 'outlined'} aria-pressed={title === selected} onClick={() => setSelected(title)}>
              {content(title, text)}
            </CardButton>
          </li>
        ))}
      </Grid>
      <output>Escolhida: {selected}</output>
    </div>
  )
}

const meta = {
  title: 'Components/CardButton',
  component: CardButton,
  args: {
    variant: 'default',
    children: content('React', 'Componentes e hooks')
  },
  parameters: {
    docs: {
      description: {
        component:
          'Cartão inteiro clicável que faz uma ação: um `<button type="button">` de verdade, com a superfície do `Card` (`variant`, `padding` e `animation`, e os mesmos ganchos `--enchase-card-*`), anel de foco, camadas de hover e de pressionado, e `disabled`. O `type` padrão é `button`, então ele não envia um formulário sozinho. O conteúdo de um `<button>` só pode ter elementos de texto (`span`, `strong`, `Badge`, imagens), sem outro botão, link ou campo dentro, e tudo o que está dentro entra no nome acessível. Para navegar, use `CardLink`. Dentro de uma lista, ponha o botão num `li`: ele ocupa a altura do item.'
      }
    }
  },
  argTypes: {
    variant: {
      description: 'Aparência da superfície, a mesma do `Card`. Só a `elevated` sobe ao passar o ponteiro.',
      control: 'select',
      options: ['default', 'elevated', 'outlined'],
      table: { defaultValue: { summary: 'default' } }
    },
    padding: {
      description: 'Espaçamento interno (qualquer valor CSS), como no `Card`. Sem ele vale o espaçamento padrão, que a classe de quem usa sempre vence.',
      control: 'text'
    },
    animation: {
      description: 'false desliga o movimento. { tuning: { duration, distance } } ajusta o lift da variante `elevated` (segundos e pixels). O lift só roda com ponteiro fino e sem preferência de movimento reduzido.',
      control: 'object',
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'lift' } }
    },
    disabled: {
      description: 'Desativa o botão: ele sai da ordem do Tab, não responde ao clique e fica com a opacidade de `--enchase-card-opacity-disabled`.',
      control: 'boolean'
    },
    className: {
      description: 'Classe do botão (`data-slot="card-button"`). Também dá para estilizar por `data-variant` e `data-motion`.',
      control: 'text'
    },
    children: { control: false },
    style: { control: false }
  }
} satisfies Meta<typeof CardButton>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Elevated: Story = {
  args: { variant: 'elevated' }
}

export const Outlined: Story = {
  args: { variant: 'outlined' }
}

export const Disabled: Story = {
  args: { variant: 'outlined', disabled: true, children: content('Em breve', 'Ainda não está disponível') }
}

export const WithBadge: Story = {
  args: {
    variant: 'outlined',
    children: (
      <>
        <span style={{ display: 'block', fontWeight: 600 }}>Experiência</span>
        <span style={{ display: 'block', color: 'var(--enchase-color-text-secondary)' }}>
          Acme Ltda <Badge variant="success">Atual</Badge>
        </span>
      </>
    )
  }
}

export const InAList: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Uma grade de escolhas sem CSS à mão: o `Grid` é um `ul`, cada botão fica num `li` e ocupa a altura da linha. Aqui o botão escolhido usa `aria-pressed` e a variante `elevated`.'
      }
    }
  },
  render: () => <SelectableSkills />
}
