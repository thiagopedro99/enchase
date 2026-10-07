import { LiveStrip } from '@docs/components/LiveStrip/index.tsx'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Páginas/Faixa ao vivo da Introdução',
  component: LiveStrip,
  tags: ['!dev', '!autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof LiveStrip>

export default meta

type Story = StoryObj<typeof meta>

export const Faixa: Story = {}
