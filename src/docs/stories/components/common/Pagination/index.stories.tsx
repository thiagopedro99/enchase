import { useState } from 'react'
import { Pagination } from 'enchase'
import { defaultBoundaryCount, defaultPage, defaultSiblingCount, defaultSize } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const ControlledDemo = () => {
  const [page, setPage] = useState(7)

  return (
    <div style={{ display: 'grid', gap: '0.75rem', justifyItems: 'start' }}>
      <Pagination ariaLabel="Results" pageCount={24} page={page} onPageChange={setPage} />
      <div style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>Page {page} of 24</div>
    </div>
  )
}

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  args: {
    pageCount: 20,
    ariaLabel: 'Results',
    siblingCount: defaultSiblingCount,
    boundaryCount: defaultBoundaryCount,
    size: defaultSize
  },
  parameters: {
    docs: {
      description: {
        component:
          'Navigation between the pages of a list or table: numbered buttons, previous and next, with ellipses when the list is long. It is a `<nav>` with a list of buttons, and the current page has `aria-current="page"`. Previous and next become unavailable (`aria-disabled`) at the ends, without taking the focus away from the user who just clicked. The texts for screen readers come from `labels.pagination`, `labels.previousPage` and `labels.nextPage` of the `UIProvider`. It accepts `ref`, which goes to the `<nav>`, and the attributes of the `<nav>`.'
      }
    }
  },
  argTypes: {
    pageCount: {
      description: 'Total number of pages. Below 1, the component shows nothing.',
      control: 'number'
    },
    page: {
      description: 'Current page when the component is controlled; the first page is 1. It also requires onPageChange. Outside the range, the first or the last page is used. See the Controlled story.',
      control: false
    },
    defaultPage: {
      description: 'Initial page, for use without external control.',
      control: 'number',
      table: { defaultValue: { summary: String(defaultPage) } }
    },
    onPageChange: {
      description: 'Called with the number of the page the user chose, through the numbered buttons or through previous and next.',
      control: false
    },
    siblingCount: {
      description: 'How many pages show on each side of the current one before the ellipses.',
      control: 'number',
      table: { defaultValue: { summary: String(defaultSiblingCount) } }
    },
    boundaryCount: {
      description: 'How many pages are always visible at the start and at the end of the list.',
      control: 'number',
      table: { defaultValue: { summary: String(defaultBoundaryCount) } }
    },
    size: {
      description: 'Size of the buttons: sm is 2 rem on a side and md is 2.5 rem.',
      control: 'inline-radio',
      options: ['sm', 'md'],
      table: { defaultValue: { summary: `'${defaultSize}'` } }
    },
    ariaLabel: {
      description: 'Name of the navigation for screen readers. Without it, labels.pagination of the UIProvider is used.',
      control: 'text'
    },
    animation: {
      description: 'Animation of the button highlight on hover and on press. false turns it off; { tuning: { duration } } sets the duration in seconds.',
      control: false,
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'fade' } }
    }
  }
} satisfies Meta<typeof Pagination>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Small: Story = {
  args: { size: 'sm' }
}

export const FewPages: Story = {
  args: { pageCount: 5 }
}

export const MoreNeighbors: Story = {
  args: { pageCount: 60, defaultPage: 30, siblingCount: 2, boundaryCount: 2 }
}

export const SinglePage: Story = {
  args: { pageCount: 1 }
}

export const Controlled: Story = {
  parameters: { controls: { disable: true } },
  render: () => <ControlledDemo />
}
