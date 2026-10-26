import { Badge, CardLink, Grid } from 'enchase'

import { ClickProbe } from '@docs/shared/components/ClickProbe.tsx'

import type { Meta, StoryObj } from '@storybook/react-vite'

const projects = [
  ['Enchase', 'React component library', '/projects/enchase'],
  ['Metrics dashboard', 'Real-time charts and tables', '/projects/metrics'],
  ['Example store', 'Cart, payment and orders', '/projects/shop']
]

const content = (title: string, text: string) => (
  <>
    <h3 style={{ margin: 0, fontSize: '1rem' }}>{title}</h3>
    <p style={{ margin: '0.25rem 0 0', color: 'var(--enchase-color-text-secondary)' }}>{text}</p>
  </>
)

const meta = {
  title: 'Components/CardLink',
  component: CardLink,
  args: {
    href: '/projects/enchase',
    variant: 'outlined',
    children: content('Enchase', 'React component library')
  },
  parameters: {
    docs: {
      description: {
        component:
          'A card that is clickable as a whole and leads to another page: a real `<a href>`, with the surface of the `Card` (`variant`, `padding` and `animation`, and the same `--enchase-card-*` hooks), a focus ring and hover and pressed layers. It goes through the `navigate` of the `UIProvider` for app routes, like the `Link` (see `native`, `target` and `download`). With `target="_blank"`, the `rel` becomes `noopener noreferrer` and the text "opens in a new tab" is added to the accessible name, with no icon: the design of the card is yours. Everything inside the card is included in the name of the link, so prefer a short title and a short supporting text. The content of an `<a>` accepts headings and paragraphs, but not another link or button. For an action, use `CardButton`.'
      }
    }
  },
  argTypes: {
    href: {
      description: 'Destination of the link, with the same rules as the `Link`: an app route goes to the `navigate` of the `UIProvider`; anchors, the hash of the current page and external URLs are left to the browser.',
      control: 'text'
    },
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
    native: {
      description: 'Leaves the click to the browser even on an app route.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    target: {
      description: 'With `_blank`, it opens in a new tab and adds the text "opens in a new tab" for screen readers. The default `rel` becomes `noopener noreferrer`.',
      control: 'inline-radio',
      options: ['_self', '_blank']
    },
    download: {
      description: 'Any value, including an empty one, makes the browser download the file instead of navigating.',
      control: 'text'
    },
    rel: {
      description: 'Relationship of the link. Without a value, `target="_blank"` uses `noopener noreferrer`.',
      control: 'text'
    },
    onClick: {
      description: 'Runs before the click is handled. If it calls `preventDefault`, `navigate` is not called.',
      control: false
    },
    className: {
      description: 'Class of the link (`data-slot="card-link"`). You can also style it by `data-variant` and `data-motion`.',
      control: 'text'
    },
    children: { control: false },
    style: { control: false }
  },
  render: (args) => (
    <ClickProbe>
      <div style={{ inlineSize: 'min(24rem, 100%)' }}>
        <CardLink {...args} />
      </div>
    </ClickProbe>
  )
} satisfies Meta<typeof CardLink>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Elevated: Story = {
  args: { variant: 'elevated' }
}

export const OpensInNewTab: Story = {
  args: { href: 'https://github.com/thiagopedro99/enchase', target: '_blank', children: content('Code on GitHub', 'Opens the repository') }
}

export const WithBadge: Story = {
  args: {
    children: (
      <>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>
          Enchase <Badge variant="success">New</Badge>
        </h3>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--enchase-color-text-secondary)' }}>React component library</p>
      </>
    )
  }
}

export const ProjectList: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'A real list of projects: the `Grid` is a `ul`, each card sits in an `li` and fills the height of the row, even when the texts have different lengths. No hand-written `role` and no repeated CSS.'
      }
    }
  },
  render: () => (
    <ClickProbe>
      <Grid as="ul" columns={{ xs: 1, md: 3 }} aria-label="Projects">
        {projects.map(([title, text, href], index) => (
          <li key={href}>
            <CardLink href={href} variant={index === 0 ? 'elevated' : 'outlined'}>
              {content(title, text)}
            </CardLink>
          </li>
        ))}
      </Grid>
    </ClickProbe>
  )
}
