import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties } from 'react'

const meta = {
  title: 'System/GlobalStyles',
  tags: ['!autodocs'],
  parameters: { layout: 'padded' }
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const CustomHooks: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The headings `h1` to `h6` of the `GlobalStyles` take their weight from `--enchase-heading-font-weight`, which falls back to the medium weight of the theme (`--enchase-font-weight-medium`). It only reaches the headings of the page: the title of a `Modal` or of a `Drawer` sets its own weight, with its own hook. Here the headings are semibold.'
      }
    }
  },
  render: () => (
    <div style={{ '--enchase-heading-font-weight': 'var(--enchase-font-weight-semibold)' } as CSSProperties}>
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <h4>Heading 4</h4>
      <h5>Heading 5</h5>
      <h6>Heading 6</h6>
    </div>
  )
}
