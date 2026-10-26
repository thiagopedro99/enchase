import { LiveStrip } from '@docs/components/LiveStrip/index.tsx'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Pages/Introduction live strip',
  component: LiveStrip,
  tags: ['!dev', '!autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta<typeof LiveStrip>

export default meta

type Story = StoryObj<typeof meta>

export const Faixa: Story = {}
