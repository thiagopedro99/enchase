import { useState } from 'react'
import { Button, Layout } from 'enchase'

import { ButtonDemo, CardDemo, CheckboxDemo, LoadingDemo } from './Basics.tsx'
import { defaultArgs, menuSections, modes, presets, reducedMotionInstructions } from './defaultData.ts'
import { ModalDemo, NavbarDrawerDemo, PopoverDemo, SidebarDrawerDemo, ToastDemo, TooltipDemo } from './Overlays.tsx'
import { Stage } from './Stage.tsx'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { MotionStoryArgs } from './types.ts'

const CopyInstructions = () => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(reducedMotionInstructions)
    setCopied(true)
  }

  return (
    <Button variant="outline" size="sm" onClick={copy}>
      {copied ? 'Instruções copiadas' : 'Copiar instruções de reduced motion'}
    </Button>
  )
}

const meta = {
  title: 'Sistema/Movimento',
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
  args: defaultArgs,
  argTypes: {
    preset: { description: 'Escala a duração e a distância de todas as receitas.', control: 'select', options: presets },
    mode: { description: 'auto respeita prefers-reduced-motion; never desliga todo o movimento.', control: 'inline-radio', options: modes },
    baseDuration: { description: 'Duração base em ms (token --enchase-motion-duration-base). A rápida vale 60% e a lenta 120%.', control: { type: 'range', min: 50, max: 600, step: 10 } },
    distance: { description: 'Distância maior de entrada em px (--enchase-motion-distance-md).', control: { type: 'range', min: 0, max: 80, step: 2 } },
    gentleDuration: { description: 'Duração da mola gentle (usada no Modal), em segundos.', control: { type: 'range', min: 0.2, max: 1.2, step: 0.05 } },
    snappyBounce: { description: 'Elasticidade da mola snappy (toast, popover, tooltip).', control: { type: 'range', min: 0, max: 0.6, step: 0.05 } },
    bouncyBounce: { description: 'Elasticidade da mola bouncy.', control: { type: 'range', min: 0, max: 0.8, step: 0.05 } }
  }
} satisfies Meta<MotionStoryArgs>

export default meta

type Story = StoryObj<MotionStoryArgs>

export const Demonstracoes: Story = {
  render: (args) => (
    <Stage args={args}>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <CopyInstructions />
          <span style={{ fontSize: '0.875rem' }}>Para ver o reduced motion, emule no DevTools; o modo "Sem movimento" da barra desliga tudo.</span>
        </div>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))' }}>
          <ModalDemo />
          <TooltipDemo />
          <ToastDemo />
          <PopoverDemo />
          <SidebarDrawerDemo />
          <NavbarDrawerDemo />
          <CheckboxDemo />
          <ButtonDemo />
          <CardDemo />
          <LoadingDemo />
        </div>
      </div>
    </Stage>
  )
}

export const MenuNoLayout: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <Stage args={args}>
      <Layout pageTitle="Início" brand="Enchase" navigationSections={menuSections}>
        <h1>Recolher e expandir</h1>
        <p>Use o botão de menu na barra superior: a largura e a coluna do conteúdo animam juntas, os rótulos fazem fade e a pílula do item ativo desliza.</p>
      </Layout>
    </Stage>
  )
}
