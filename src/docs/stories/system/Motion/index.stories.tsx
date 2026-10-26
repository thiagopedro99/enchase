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
      {copied ? 'Instructions copied' : 'Copy reduced motion instructions'}
    </Button>
  )
}

const meta = {
  title: 'System/Motion',
  tags: ['!autodocs'],
  parameters: { layout: 'padded' },
  args: defaultArgs,
  argTypes: {
    preset: { description: 'Scales the duration and the distance of all the recipes.', control: 'select', options: presets },
    mode: { description: '`auto` respects `prefers-reduced-motion`; `never` turns off all motion.', control: 'inline-radio', options: modes },
    baseDuration: { description: 'Base duration in ms (token `--enchase-motion-duration-base`). The fast one is 60% of it and the slow one 120%.', control: { type: 'range', min: 50, max: 600, step: 10 } },
    distance: { description: 'Largest entry distance in px (`--enchase-motion-distance-md`).', control: { type: 'range', min: 0, max: 80, step: 2 } },
    gentleDuration: { description: 'Duration of the `gentle` spring (Modal), in ms. The curve plays in full in that time (`--enchase-motion-spring-gentle-duration`). Above 300 ms the theme warns.', control: { type: 'range', min: 100, max: 600, step: 10 } },
    snappyDuration: { description: 'Duration of the `snappy` spring (toast and popover), in ms (`--enchase-motion-spring-snappy-duration`).', control: { type: 'range', min: 100, max: 600, step: 10 } },
    snappyBounce: { description: 'Bounce of the `snappy` spring, from 0 to 0.95.', control: { type: 'range', min: 0, max: 0.6, step: 0.05 } },
    bouncyDuration: { description: 'Duration of the `bouncy` spring, in ms (up to 400 ms without a warning).', control: { type: 'range', min: 100, max: 700, step: 10 } },
    bouncyBounce: { description: 'Bounce of the `bouncy` spring.', control: { type: 'range', min: 0, max: 0.8, step: 0.05 } }
  }
} satisfies Meta<MotionStoryArgs>

export default meta

type Story = StoryObj<MotionStoryArgs>

export const Demos: Story = {
  render: (args) => (
    <Stage args={args}>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <CopyInstructions />
          <span style={{ fontSize: '0.875rem' }}>To see reduced motion, emulate it in DevTools; the "No motion" mode in the toolbar turns everything off.</span>
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

export const MenuInTheLayout: Story = {
  parameters: { layout: 'fullscreen' },
  render: (args) => (
    <Stage args={args}>
      <Layout pageTitle="Home" brand="Enchase" navigationSections={menuSections}>
        <h1>Collapse and expand</h1>
        <p>Use the menu button in the top bar: the width and the content column animate together, the labels fade and the pill of the active item slides.</p>
      </Layout>
    </Stage>
  )
}
