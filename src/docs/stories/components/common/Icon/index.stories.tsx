import { Button, Icon } from 'enchase'
import { CloseIcon } from 'enchase/icons'
import * as icons from 'enchase/icons'

import type { Meta, StoryObj } from '@storybook/react-vite'

const iconsRecipe = [
  'A 24x24 SVG container, with a 2 px stroke and the color of the text (`currentColor`). Use it to draw your own icons from SVG paths.',
  '',
  'The icons that the components use inside (menu, close, arrows, plus, minus, eye, sun and moon, among others) come ready-made from `enchase/icons`, one component per icon, in the Gallery story. It is not an icon library: it only has what some component uses. For the rest, use an icon library directly, without the `Icon`. Any React node works where there is content or an `icon` prop:',
  '',
  '```tsx',
  "import { Rocket } from 'lucide-react'",
  "import { Button } from 'enchase'",
  "import { CheckIcon } from 'enchase/icons'",
  '',
  '<Button variant="primary">',
  '  <CheckIcon size={18} />',
  '  Confirm',
  '</Button>',
  '',
  '<Button variant="outline">',
  '  <Rocket size={18} aria-hidden="true" />',
  '  Get started',
  '</Button>',
  '```'
].join('\n')

const meta = {
  title: 'Components/Icon',
  component: Icon,
  args: {
    children: <path d="M12 5v14M5 12h14" />
  },
  argTypes: {
    children: {
      description: 'SVG shapes (path, circle, rect, line) drawn in a 24x24 viewBox.',
      control: false
    },
    name: {
      description: 'Optional identifier. It becomes the data-icon attribute, useful for styling from outside or in tests.',
      control: 'text'
    },
    size: {
      description: 'Side length of the icon in pixels.',
      control: 'number',
      table: { defaultValue: { summary: '24' } }
    },
    title: {
      description: 'Accessible name. Without it, the icon is decorative (aria-hidden="true"); with it, it becomes role="img" and gets a title element inside the SVG.',
      control: 'text'
    },
    directional: {
      description: 'Mirrors the icon in RTL. Use it on arrows and chevrons.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    className: {
      description: 'Class of the element (data-slot="icon"), which wins over the library style.',
      control: 'text'
    },
    style: { control: false }
  },
  parameters: {
    docs: {
      description: { component: iconsRecipe }
    }
  }
} satisfies Meta<typeof Icon>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithTitle: Story = {
  args: { name: 'plus', title: 'Add', size: 32 }
}

export const Directional: Story = {
  args: { name: 'arrow-right', directional: true, children: <path d="M5 12h14M13 6l6 6-6 6" /> },
  parameters: { docs: { description: { story: 'On a page with dir="rtl" the arrow points to the left.' } } }
}

export const InsideAButton: Story = {
  render: () => (
    <Button variant="primary">
      <Icon size={18}>
        <path d="M20 6 9 17l-5-5" />
      </Icon>
      Confirm
    </Button>
  )
}

export const Gallery: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'The icons of `enchase/icons`. Each one accepts `size`, `title` and the attributes of an `<svg>`; without `title` it is decorative. The ones that point to one side mirror in RTL on their own.' } }
  },
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', maxInlineSize: '48rem' }}>
      {Object.entries(icons).map(([name, Component]) => (
        <div key={name} style={{ display: 'grid', justifyItems: 'center', alignContent: 'start', gap: '0.5rem', inlineSize: '10rem', padding: '1rem', border: '1px solid var(--enchase-color-border)', borderRadius: 'var(--enchase-radius-md)' }}>
          <Component size={28} />
          <span style={{ fontSize: '0.75rem', color: 'var(--enchase-color-text-secondary)', textAlign: 'center', overflowWrap: 'anywhere' }}>{name}</span>
        </div>
      ))}
    </div>
  )
}

export const IconOnlyButton: Story = {
  parameters: {
    controls: { disable: true },
    docs: { description: { story: 'An icon-only button needs an `aria-label`: the icon is decorative and the button gets its name from the label.' } }
  },
  render: () => (
    <Button variant="ghost" aria-label="Close">
      <CloseIcon />
    </Button>
  )
}
