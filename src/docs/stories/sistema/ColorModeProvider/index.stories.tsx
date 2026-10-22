import { Button, Card, ColorModeProvider, ThemeToggle, useColorMode } from 'enchase'
import { shadcn } from 'enchase/styles/shadcn'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'

const Preview = () => {
  const { mode, resolvedMode } = useColorMode()

  return (
    <Card variant="outlined" style={{ display: 'grid', gap: '1rem', justifyItems: 'start' }}>
      <span>{`mode: ${mode} / resolvedMode: ${resolvedMode}`}</span>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <ThemeToggle />
        <Button variant="primary">Primário</Button>
        <Button variant="outline">Contorno</Button>
      </div>
    </Card>
  )
}

const Stage = ({ theme, mode, defaultMode, onModeChange, storageKey, cssLayer }: ComponentProps<typeof ColorModeProvider>) => {
  const { mode: outerMode } = useColorMode()

  return (
    <ColorModeProvider theme={theme} mode={mode ?? outerMode} defaultMode={defaultMode} onModeChange={onModeChange} storage={null} storageKey={storageKey} cssLayer={cssLayer}>
      <Preview />
    </ColorModeProvider>
  )
}

const meta = {
  title: 'Sistema/ColorModeProvider',
  component: ColorModeProvider,
  args: { children: undefined },
  argTypes: {
    children: { description: 'A aplicação.', control: false },
    theme: {
      description: 'Tema personalizado, como { style, brand, fonts, motion, shape, radius, light, dark }, o mesmo que createTheme aceita: style troca o visual do kit inteiro (um estilo importado de `enchase/styles/<nome>`, como o shadcn), a cor da marca gera a paleta, shape escolhe a forma dos cantos (pill, soft ou square) e radius ajusta um raio, e light e dark ajustam cores por modo. O que você passa vence o style. Todo valor é validado, e em desenvolvimento o provedor avisa no console sobre contraste e duração. Sem ele vale o tema padrão.',
      control: 'object'
    },
    mode: {
      description: 'Modo controlado: light, dark ou system. Com ele o provedor não guarda a escolha, e quem usa muda o valor em onModeChange.',
      control: 'inline-radio',
      options: ['light', 'dark', 'system']
    },
    defaultMode: {
      description: 'Modo usado enquanto não há escolha guardada nem a prop mode. system segue a preferência do sistema.',
      control: 'inline-radio',
      options: ['light', 'dark', 'system'],
      table: { defaultValue: { summary: 'system' } }
    },
    onModeChange: {
      description: 'Chamado com o novo modo quando setMode ou toggleMode são usados, inclusive com mode controlado.',
      control: false
    },
    storage: {
      description: 'Onde guardar a escolha, com getItem e setItem. O padrão é o localStorage, lido só depois de montar. null desliga a persistência.',
      control: false,
      table: { type: { summary: '{ getItem, setItem } | null' }, defaultValue: { summary: 'localStorage' } }
    },
    storageKey: {
      description: 'Chave da escolha no storage. Use a mesma no ColorModeScript.',
      control: 'text',
      table: { defaultValue: { summary: 'enchase-color-mode' } }
    },
    cssLayer: {
      description: 'Nome de uma @layer para as variáveis do tema. Use com enchase/styles.layer.css, como cssLayer="enchase-theme".',
      control: 'text'
    }
  },
  parameters: {
    docs: {
      description: {
        component: 'Aplica o tema: injeta as variáveis `--enchase-*`, define `data-theme` e `color-scheme` no `<html>` e guarda o modo (`light`, `dark` ou `system`). Os componentes leem as variáveis, e `useColorMode` devolve `{ mode, resolvedMode, setMode, toggleMode }`.'
      }
    }
  },
  render: (args) => <Stage {...args} />
} satisfies Meta<typeof ColorModeProvider>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithBrandColor: Story = {
  args: { theme: { brand: '#0b6bcb' } }
}

export const WithStyle: Story = {
  args: { theme: { style: shadcn } }
}
