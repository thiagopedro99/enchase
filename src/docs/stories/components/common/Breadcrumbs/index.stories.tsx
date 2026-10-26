import { Breadcrumbs } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  args: {
    items: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'docs', label: 'Documentation', href: '/docs' },
      { id: 'api', label: 'API' }
    ],
    maxItems: 4
  },
  parameters: {
    docs: {
      description: {
        component: 'A breadcrumb trail: a `<nav>` with an ordered list, in which the last item is the current page. A long trail hides the middle items behind an ellipsis button that shows the full path.'
      }
    }
  },
  argTypes: {
    items: {
      description: 'The trail, in order. The last item is the current page; the others become links when they have an href.',
      control: 'object'
    },
    maxItems: {
      description: 'Above this number, the middle items become an ellipsis button that shows the full path.',
      control: 'number'
    },
    ariaLabel: {
      description: 'Accessible name of the navigation. The default comes from the UIProvider (labels.breadcrumb).',
      control: 'text'
    },
    className: {
      description: 'User class, applied to the root after the library class. It also accepts style and data-slot on the parts.',
      control: false
    }
  }
} satisfies Meta<typeof Breadcrumbs>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Collapsed: Story = {
  args: {
    items: [
      { id: 'a', label: 'Level A', href: '/a' },
      { id: 'b', label: 'Level B', href: '/b' },
      { id: 'c', label: 'Level C', href: '/c' },
      { id: 'd', label: 'Level D', href: '/d' },
      { id: 'e', label: 'Level E', href: '/e' },
      { id: 'f', label: 'Level F' }
    ],
    maxItems: 4
  }
}
