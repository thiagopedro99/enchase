import { Breadcrumbs } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  args: {
    items: [
      { value: 'home', label: 'Home', href: '/' },
      { value: 'docs', label: 'Documentation', href: '/docs' },
      { value: 'api', label: 'API' }
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
      description: 'The trail, in order. Each item has `label` (the text) and, optionally, `href` (the destination: an item without it is plain text), `native` (the browser loads the page, without going through `navigate`) and `value`, a name that is unique in the trail, which is the key of the item; an item without it is keyed by its position. `id` is the old name of `value`: it is still accepted until 1.0, and `value` wins when both are given. The last item is the current page, with no link even when it has an `href`.',
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
    },
    ref: {
      description: 'Ref of the root `<nav>` (`data-slot="breadcrumbs"`). It stays `null` when `items` is empty, because nothing is rendered then.',
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
      { value: 'a', label: 'Level A', href: '/a' },
      { value: 'b', label: 'Level B', href: '/b' },
      { value: 'c', label: 'Level C', href: '/c' },
      { value: 'd', label: 'Level D', href: '/d' },
      { value: 'e', label: 'Level E', href: '/e' },
      { value: 'f', label: 'Level F' }
    ],
    maxItems: 4
  }
}
