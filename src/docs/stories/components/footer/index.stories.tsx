import { Footer } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A footer with the year, the company name, a notice and links. The default year is the current year.'
      }
    }
  },
  args: {
    companyName: 'Enchase',
    notice: 'MIT License.'
  },
  argTypes: {
    companyName: { description: 'Name shown after the year. No default value.', control: 'text' },
    notice: { description: 'Notice after the name, such as the license. No default value.', control: 'text' },
    year: { description: 'Year shown. The default is the current year.', control: 'number' },
    links: {
      description: 'Links shown before the notice, like [{ label, href }].',
      control: 'object'
    },
    className: { description: 'Class of the root (data-slot="footer").', control: 'text' },
    style: { control: false }
  }
} satisfies Meta<typeof Footer>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithLinks: Story = {
  args: {
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Repository', href: 'https://github.com/thiagopedro99/enchase' }
    ]
  }
}

export const OnlyTheYear: Story = {
  args: { companyName: undefined, notice: undefined }
}
