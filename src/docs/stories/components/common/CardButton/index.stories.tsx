import { useState } from 'react'
import { Badge, CardButton, Grid } from 'enchase'

import type { Meta, StoryObj } from '@storybook/react-vite'

const skills = [
  ['React', 'Components and hooks'],
  ['TypeScript', 'End-to-end types'],
  ['CSS Modules', 'Styling with no runtime'],
  ['Vite', 'Fast build'],
  ['Storybook', 'Living documentation'],
  ['Vitest', 'Behavior tests']
]

const content = (title: string, text: string) => (
  <>
    <span style={{ display: 'block', fontWeight: 600 }}>{title}</span>
    <span style={{ display: 'block', color: 'var(--enchase-color-text-secondary)' }}>{text}</span>
  </>
)

const SelectableSkills = () => {
  const [selected, setSelected] = useState('React')

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <Grid as="ul" columns={{ xs: 1, sm: 2, lg: 3 }} aria-label="Skills">
        {skills.map(([title, text]) => (
          <li key={title}>
            <CardButton variant={title === selected ? 'elevated' : 'outlined'} aria-pressed={title === selected} onClick={() => setSelected(title)}>
              {content(title, text)}
            </CardButton>
          </li>
        ))}
      </Grid>
      <output>Selected: {selected}</output>
    </div>
  )
}

const meta = {
  title: 'Components/CardButton',
  component: CardButton,
  args: {
    variant: 'default',
    children: content('React', 'Components and hooks')
  },
  parameters: {
    docs: {
      description: {
        component:
          'A card that is clickable as a whole and performs an action: a real `<button type="button">`, with the surface of the `Card` (`variant`, `padding` and `animation`, and the same `--enchase-card-*` hooks), a focus ring, hover and pressed layers, and `disabled`. The default `type` is `button`, so it does not submit a form on its own. The content of a `<button>` can only hold text elements (`span`, `strong`, `Badge`, images), with no other button, link or field inside, and everything inside is included in the accessible name. To navigate, use `CardLink`. Inside a list, put the button in an `li`: it fills the height of the item.'
      }
    }
  },
  argTypes: {
    variant: {
      description: 'Appearance of the surface, the same as the `Card`. Only the `elevated` one rises when the pointer is over it.',
      control: 'select',
      options: ['default', 'elevated', 'outlined'],
      table: { defaultValue: { summary: 'default' } }
    },
    padding: {
      description: 'Inner spacing (any CSS value), as in the `Card`. Without it, the default spacing applies, and a class of your own always wins over it.',
      control: 'text'
    },
    animation: {
      description: 'false turns the motion off. { tuning: { duration, distance } } sets the lift of the `elevated` variant (seconds and pixels). The lift only runs with a fine pointer and with no preference for reduced motion.',
      control: 'object',
      table: { type: { summary: 'false | { recipe, tuning }' }, defaultValue: { summary: 'lift' } }
    },
    disabled: {
      description: 'Disables the button: it leaves the Tab order, does not respond to clicks and gets the opacity of `--enchase-card-opacity-disabled`.',
      control: 'boolean'
    },
    className: {
      description: 'Class of the button (`data-slot="card-button"`). You can also style it by `data-variant` and `data-motion`.',
      control: 'text'
    },
    children: { control: false },
    style: { control: false }
  }
} satisfies Meta<typeof CardButton>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Elevated: Story = {
  args: { variant: 'elevated' }
}

export const Outlined: Story = {
  args: { variant: 'outlined' }
}

export const Disabled: Story = {
  args: { variant: 'outlined', disabled: true, children: content('Coming soon', 'Not available yet') }
}

export const WithBadge: Story = {
  args: {
    variant: 'outlined',
    children: (
      <>
        <span style={{ display: 'block', fontWeight: 600 }}>Experience</span>
        <span style={{ display: 'block', color: 'var(--enchase-color-text-secondary)' }}>
          Acme Labs <Badge variant="success">Current</Badge>
        </span>
      </>
    )
  }
}

export const InAList: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'A grid of choices with no hand-written CSS: the `Grid` is a `ul`, each button sits in an `li` and fills the height of the row. Here the selected button uses `aria-pressed` and the `elevated` variant.'
      }
    }
  },
  render: () => <SelectableSkills />
}
