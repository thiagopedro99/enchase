import { Card, Grid } from 'enchase'
import { asArgType } from '@docs/shared/argTypes.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const cell = (label: string) => (
  <div key={label} style={{ background: 'var(--enchase-color-surface-container)', padding: '1rem', borderRadius: 'var(--enchase-radius-md)' }}>
    {label}
  </div>
)

const cells = ['One', 'Two', 'Three', 'Four', 'Five', 'Six'].map(cell)

const meta = {
  title: 'Components/Grid',
  component: Grid,
  args: {
    columns: 3,
    children: cells
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A CSS grid that reduces its columns by itself when they do not fit, without a media query. With `columns` as an object, the number of columns changes at the breakpoints of the `UIProvider`, in plain CSS and with no wrong frame before hydration. With `centerLastRow`, the last incomplete row is centered. With `as`, the root becomes another structure tag, such as `ul` for a list of cards.'
      }
    }
  },
  argTypes: {
    as: asArgType,
    columns: {
      description:
        'A number, which is the maximum number of columns on wide screens: when they do not fit, the grid reduces them by itself, without a media query. Or an object with the number of columns from each breakpoint up (`{ xs: 1, md: 2, lg: 4 }`): it is mobile first, a breakpoint without a value repeats the smaller one before it, and the breakpoint values are those of the `UIProvider`. Numbers become integers of at least 1.',
      control: { type: 'number', min: 1, max: 6 },
      table: { defaultValue: { summary: '1' }, type: { summary: 'number | { xs?: number, sm?: number, md?: number, lg?: number, xl?: number, xxl?: number }' } }
    },
    minColumnWidth: {
      description: 'Minimum width of each column (any CSS value). When set, it is used instead of columns and the grid uses auto-fit.',
      control: 'text'
    },
    gap: {
      description: 'Space between the cells, through a CSS variable. The default comes from the spacing token.',
      control: 'text'
    },
    centerLastRow: {
      description:
        'Centers the last row when it is incomplete, such as the last two cards of five in three columns. The grid becomes a flex row that wraps: each cell has the width of one column and the full rows stay aligned to the columns. It works with `columns` (number or object) and is ignored with `minColumnWidth`, because then the number of columns depends on the width.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    className: { description: 'Class of the root (data-slot="grid").', control: 'text' },
    style: { control: false }
  }
} satisfies Meta<typeof Grid>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const FixedColumns: Story = {
  args: { columns: 2, gap: '2rem' }
}

export const MinimumColumnWidth: Story = {
  args: { columns: undefined, minColumnWidth: '12rem' }
}

export const ResponsiveColumns: Story = {
  args: { columns: { xs: 1, sm: 2, lg: 4 }, children: ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'].map(cell) },
  parameters: { docs: { description: { story: 'One column on a phone, two from `sm` up and four from `lg` up. Change the width of the frame (or the Storybook viewport) to see the columns switch at the breakpoints.' } } }
}

export const CenteredLastRow: Story = {
  args: { columns: 3, centerLastRow: true, children: ['One', 'Two', 'Three', 'Four', 'Five'].map(cell) },
  parameters: { docs: { description: { story: 'Five cells in three columns: the two in the last row are centered, and the first row stays in the columns.' } } }
}

export const CenteredAndResponsive: Story = {
  args: { columns: { xs: 2, lg: 4 }, centerLastRow: true, children: ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'].map(cell) },
  parameters: { docs: { description: { story: 'Both together: the last row at each breakpoint is centered (three cells in four columns, one in two).' } } }
}

export const AsList: Story = {
  args: {
    as: 'ul',
    columns: 3,
    'aria-label': 'Projects',
    children: ['One', 'Two', 'Three', 'Four', 'Five', 'Six'].map((label) => (
      <Card key={label} as="li">
        {label}
      </Card>
    ))
  },
  parameters: { docs: { description: { story: 'With `as="ul"` the grid is a list: it loses bullets, margin and indent and gains `role="list"`, and each `Card as="li"` is an item that stretches to the height of the row.' } } }
}
