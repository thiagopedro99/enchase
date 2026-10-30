import { useState } from 'react'
import { Button, Icon, Sidebar } from 'enchase'

import type { ComponentProps, CSSProperties } from 'react'
import type { SidebarSection } from 'enchase'
import type { Meta, StoryObj } from '@storybook/react-vite'

const sections: SidebarSection[] = [
  {
    id: 'app',
    title: 'Application',
    items: [
      {
        id: 'home',
        label: 'Home',
        icon: (
          <Icon name="home">
            <path d="M3 11l9-8 9 8" />
            <path d="M5 10v10h14V10" />
            <path d="M10 20v-6h4v6" />
          </Icon>
        ),
        href: '/'
      },
      { id: 'components', label: 'Components', href: '/components', badge: 'New' }
    ]
  },
  { id: 'guide', title: 'On this page', items: [{ id: 'usage', label: 'Usage', href: '#usage' }] }
]

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A side menu. `permanent` stays on the page and collapses to a bar of icons; `modal` becomes a drawer with trapped focus. Each item is a route, an anchor or an action.'
      }
    }
  },
  args: { sections, variant: 'permanent', collapsed: false },
  argTypes: {
    sections: {
      description: 'Sections of the menu, like [{ id, title?, items: [{ id, label, icon?, href?, native?, badge?, onClick? }] }]. An item with href is a link; without href it is a button that calls onClick. Without icon, the item shows the first letter of its label.',
      control: false
    },
    activeSectionId: {
      description: 'Id of the anchor item marked as the current location (aria-current="location"): an item with href #id, or /page#id on the page itself. Use useScrollSpy to get it.',
      control: 'text'
    },
    currentHref: {
      description: 'Current path. It marks the item of the page (aria-current="page") and also applies to the hash of the current page. Without it, the currentHref of the UIProvider is used.',
      control: 'text'
    },
    header: {
      description: 'Fixed content at the top, such as the brand. It can be a function that receives { collapsed } to change the content on the collapsed bar.',
      control: false
    },
    footer: {
      description: 'Fixed content in the footer, above the collapse button. It can be a function that receives { collapsed }.',
      control: false
    },
    variant: {
      description: 'permanent stays on the page; modal becomes a drawer with trapped focus, an inert page and Esc to close; Esc closes only the top layer.',
      control: 'inline-radio',
      options: ['permanent', 'modal'],
      table: { defaultValue: { summary: 'permanent' } }
    },
    collapsed: {
      description: 'An icon-only bar (80px) instead of the full one. The width animates through data-state (expanded, collapsing, collapsed and expanding); with animation={false} it changes at once. It only applies to permanent.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    onToggleCollapsed: {
      description: 'Shows the collapse button in the footer and is called when the button is clicked. Without this prop the button does not appear; you keep the state of collapsed.',
      control: false
    },
    open: {
      description: 'Only in modal: opens the drawer. When closed, nothing is rendered.',
      control: 'boolean'
    },
    onClose: {
      description: 'Only in modal: called when the backdrop is clicked, Esc is pressed or an item is chosen.',
      control: false
    },
    ariaLabel: {
      description: 'Accessible name of the navigation. The default comes from the UIProvider: labels.mainNavigation in permanent and labels.mobileNavigation in modal.',
      control: 'text'
    },
    id: {
      description: 'id of the root in permanent or of the panel in modal, useful for the aria-controls of the button that opens the menu.',
      control: 'text'
    },
    animation: {
      description: 'false turns off the motion. In permanent it adjusts the collapse ({ tuning: { duration } }); in modal, the slide of the drawer ({ tuning: { distance, duration } }).',
      control: 'object',
      table: { type: { summary: 'false | { recipe, from, tuning }' } }
    },
    className: {
      description: 'Class of the root (data-slot="sidebar"); in the drawer, of the panel (data-slot="sidebar-panel"). You can also style it by data-slot, data-state and data-variant.',
      control: 'text'
    },
    style: { description: 'Style of the root in permanent or of the panel in modal.', control: false }
  }
} satisfies Meta<typeof Sidebar>

export default meta

type Story = StoryObj<typeof meta>

type SidebarProps = ComponentProps<typeof Sidebar>

const PermanentDemo = (args: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div style={{ display: 'flex', minHeight: 360 }}>
      <Sidebar {...args} variant="permanent" collapsed={collapsed} onToggleCollapsed={() => setCollapsed((value) => !value)} header={<strong>Enchase</strong>} />
    </div>
  )
}

const DrawerDemo = (args: SidebarProps) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open menu</Button>
      <Sidebar {...args} variant="modal" open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export const Permanent: Story = {
  render: (args) => <PermanentDemo {...args} />
}

export const Drawer: Story = {
  render: (args) => <DrawerDemo {...args} />
}

export const CustomHooks: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The padding of an item is one hook for both sides, `--enchase-sidebar-item-control-padding-inline`. `--enchase-sidebar-item-control-padding-inline-end` sets only the side at the end (the right in left to right text) and falls back to the hook of both sides. Here the items have 1.5 rem at the start and 0.75 rem at the end, which leaves more room for long labels and badges. The items of a collapsed sidebar keep no padding.'
      }
    }
  },
  render: (args) => (
    <div style={{ display: 'flex', minHeight: 360, '--enchase-sidebar-item-control-padding-inline': '1.5rem', '--enchase-sidebar-item-control-padding-inline-end': '0.75rem' } as CSSProperties}>
      <Sidebar {...args} variant="permanent" header={<strong>Enchase</strong>} />
    </div>
  )
}
