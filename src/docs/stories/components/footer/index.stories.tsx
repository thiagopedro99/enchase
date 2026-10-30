import { Footer } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { FooterProps } from 'enchase'

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

export const CustomHooks: Story = {
  args: {
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Repository', href: 'https://github.com/thiagopedro99/enchase' }
    ],
    style: { '--enchase-footer-padding-inline': '3rem' } as FooterProps['style']
  },
  parameters: {
    docs: {
      description: {
        story: 'The footer has padding above and below, `--enchase-footer-padding-block`, and none at the sides, because the content sits in a container that already gives the side. `--enchase-footer-padding-inline` adds the space at the sides, 0 by default. Here it is 3 rem, set in the `style` of the footer.'
      }
    }
  }
}
