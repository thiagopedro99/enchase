import { DensityGallery } from './Gallery.tsx'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'System/Density gallery',
  tags: ['!dev', '!autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'The same components in every style. The Density and Style items of the toolbar switch the look of the whole page: the attribute is on the `<html>`, so it applies to all of it at once.'
      }
    }
  },
  render: () => <DensityGallery />
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Gallery: Story = {}
