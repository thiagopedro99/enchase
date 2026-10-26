import { Badge, Flex } from 'enchase'
import { asArgType } from '@docs/shared/argTypes.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Flex',
  component: Flex,
  args: {
    direction: 'row',
    align: 'center',
    justify: 'start',
    gap: '1rem',
    wrap: false,
    children: ['One', 'Two', 'Three'].map((label) => <span key={label}>{label}</span>)
  },
  parameters: {
    docs: {
      description: {
        component: 'A flexbox container configured by props: direction, alignment, distribution, space between the children and line wrapping. In RTL, `row` starts on the right side. With `as="ul"`, it becomes a real list, such as a row of badges.'
      }
    }
  },
  argTypes: {
    as: asArgType,
    direction: { control: 'inline-radio', options: ['row', 'column', 'row-reverse', 'column-reverse'], description: 'Main axis. In RTL, row starts on the right side.' },
    align: { control: 'select', options: ['start', 'center', 'end', 'stretch', 'baseline'], description: 'Alignment on the cross axis.' },
    justify: { control: 'select', options: ['start', 'center', 'end', 'between', 'around', 'evenly'], description: 'Distribution on the main axis.' },
    gap: { control: 'text', description: 'Space between the children, passed through a CSS variable. The default comes from the spacing token.' },
    wrap: { control: 'boolean', description: 'Allows line wrapping.', table: { defaultValue: { summary: 'false' } } }
  }
} satisfies Meta<typeof Flex>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Column: Story = {
  args: { direction: 'column', align: 'start' }
}

export const BadgeList: Story = {
  args: { as: 'ul', wrap: true, gap: '0.5rem', 'aria-label': 'Technologies' },
  render: (args) => (
    <Flex {...args}>
      {['React', 'TypeScript', 'Vite', 'CSS Modules', 'Storybook'].map((label) => (
        <li key={label}>
          <Badge variant="primary">{label}</Badge>
        </li>
      ))}
    </Flex>
  ),
  parameters: { docs: { description: { story: 'A list of badges without a new component: `Flex as="ul"` with `wrap` and a `Badge` inside each `li`. It is read as a list (five items) and wraps to a new line when it does not fit.' } } }
}
