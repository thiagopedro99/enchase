import { ButtonLink, Icon } from 'enchase'
import { defaultExternalIcon } from './defaultData.ts'

import { ClickProbe } from '@docs/shared/components/ClickProbe.tsx'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/ButtonLink',
  component: ButtonLink,
  args: {
    href: '/docs',
    children: 'Documentation',
    variant: 'primary',
    size: 'md',
    fullWidth: false
  },
  argTypes: {
    href: {
      description: 'Destination of the link, with the same rules as the `Link`: an app route goes to the `navigate` of the `UIProvider`; anchors, the hash of the current page and external URLs are left to the browser.',
      control: 'text'
    },
    variant: {
      description: 'Visual style, the same as the `Button`.',
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
      table: { defaultValue: { summary: 'primary' } }
    },
    size: {
      description: 'Size, the same as the `Button`.',
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      table: { defaultValue: { summary: 'md' } }
    },
    fullWidth: {
      description: 'Takes up the full available width.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    native: {
      description: 'Leaves the click to the browser even on an app route.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    externalIcon: {
      description: 'With `target="_blank"`, shows the external link icon after the content. `false` removes only the icon (useful in an icon-only button) and keeps the "opens in a new tab" text for screen readers; in an icon-only link with `aria-label`, put the warning in the label itself.',
      control: 'boolean',
      table: { defaultValue: { summary: String(defaultExternalIcon) } }
    },
    target: {
      description: 'With `_blank`, it opens in a new tab, shows an icon (see `externalIcon`) and adds the "opens in a new tab" text for screen readers. The default `rel` becomes `noopener noreferrer`.',
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
    animation: {
      description: 'Motion recipe of the `Button`. Use false to turn it off, or { recipe, tuning } with press or lift.',
      control: false,
      table: { type: { summary: 'false | { recipe, from, tuning }' }, defaultValue: { summary: 'press' } }
    },
    onClick: {
      description: 'Runs before the click is handled. If it calls `preventDefault`, the `navigate` is not called.',
      control: false
    },
    className: {
      description: 'Class of the element (`data-slot="button-link"`), which wins over the style of the library.',
      control: 'text'
    },
    style: { control: false }
  },
  parameters: {
    docs: {
      description: {
        component: 'A link that looks like a `Button`. It is a real `<a href>`, and goes through the `navigate` of the `UIProvider` for app routes, like the `Link`.'
      }
    }
  },
  render: (args) => (
    <ClickProbe>
      <ButtonLink {...args} />
    </ClickProbe>
  )
} satisfies Meta<typeof ButtonLink>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ClickProbe>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <ButtonLink href="/docs">Primary</ButtonLink>
        <ButtonLink href="/docs" variant="secondary">
          Secondary
        </ButtonLink>
        <ButtonLink href="/docs" variant="outline">
          Outline
        </ButtonLink>
        <ButtonLink href="/docs" variant="ghost">
          Ghost
        </ButtonLink>
      </div>
    </ClickProbe>
  )
}

export const OpensInNewTab: Story = {
  args: { href: 'https://github.com/thiagopedro99/enchase', target: '_blank', variant: 'outline', children: 'Repository' }
}

export const IconOnly: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ClickProbe>
      <ButtonLink href="https://github.com/thiagopedro99/enchase" target="_blank" externalIcon={false} variant="outline" aria-label="Code on GitHub (opens in a new tab)">
        <Icon>
          <path d="M8 8l-4 4 4 4" />
          <path d="M16 8l4 4-4 4" />
          <path d="M14 5l-4 14" />
        </Icon>
      </ButtonLink>
    </ClickProbe>
  )
}
