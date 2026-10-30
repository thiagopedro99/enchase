import { Link } from 'enchase'

import { ClickProbe } from '@docs/shared/components/ClickProbe.tsx'
import { hrefCases } from './defaultData.ts'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { CSSProperties } from 'react'

const meta = {
  title: 'Components/Link',
  component: Link,
  args: {
    href: '/about',
    children: 'About'
  },
  argTypes: {
    href: {
      description: 'Destination of the link. An app route (`/about`, `/about#team`) goes to the `navigate` of the `UIProvider` when there is one. Anchors (`#id`), the hash of the current page, external URLs, `mailto:` and `tel:` are left to the browser, as are Ctrl, Cmd, Shift and the middle button.',
      control: 'text'
    },
    native: {
      description: 'Leaves the click to the browser even on an app route. Use it for routes that belong to another app, such as documentation published on the same domain.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    target: {
      description: 'With `_blank` (or any value other than `_self`) the browser opens the destination and the `navigate` is not called. With `_blank`, the default `rel` is `noopener noreferrer`.',
      control: 'inline-radio',
      options: ['_self', '_blank']
    },
    download: {
      description: 'Any value, including an empty one, makes the browser download the file instead of navigating. Text becomes the name of the file.',
      control: 'text'
    },
    rel: {
      description: 'Relationship of the link. Without a value, `target="_blank"` uses `noopener noreferrer`.',
      control: 'text'
    },
    onClick: {
      description: 'Runs before the click is handled. If it calls `preventDefault`, the `navigate` is not called.',
      control: false
    },
    className: {
      description: 'Class of the element (`data-slot="link"`), which wins over the style of the library.',
      control: 'text'
    },
    style: { control: false }
  },
  parameters: {
    docs: {
      description: {
        component: 'A text link that goes through the `navigate` of the `UIProvider` when the destination is an app route, without depending on a router. Without `navigate`, it is a plain `<a href>`. The story "Who handles each href" shows each case.'
      }
    }
  },
  render: (args) => (
    <ClickProbe>
      <Link {...args} />
    </ClickProbe>
  )
} satisfies Meta<typeof Link>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WhoHandlesEachHref: Story = {
  name: 'Who handles each href',
  parameters: { controls: { disable: true } },
  render: () => (
    <ClickProbe currentHref="/docs">
      <ul style={{ display: 'grid', gap: '0.75rem', margin: 0, paddingInlineStart: '1.25rem' }}>
        {hrefCases.map(({ id, outcome, ...link }) => (
          <li key={id}>
            <Link {...link}>{link.href}</Link>
            <div style={{ fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>{outcome}</div>
          </li>
        ))}
      </ul>
    </ClickProbe>
  )
}

export const CustomHooks: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'The line height of a link is the one of the text around it until `--enchase-link-line-height` is set. A link that stands alone in a flex or grid container is as tall as its line, so a style can give a link of 14 px a line height of 1.7143 to make it 24 px tall, the floor of a target. The shadows draw the box of each link.'
      }
    }
  },
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', fontSize: '0.875rem' }}>
      <Link href="/about" style={{ boxShadow: '0 0 0 1px var(--enchase-color-border-strong)' }}>
        Inherited line height
      </Link>
      <Link href="/about" style={{ boxShadow: '0 0 0 1px var(--enchase-color-border-strong)', '--enchase-link-line-height': '1.7143' } as CSSProperties}>
        Line height of 1.7143
      </Link>
    </div>
  )
}
