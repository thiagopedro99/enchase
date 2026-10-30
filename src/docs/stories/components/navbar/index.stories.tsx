import { useEffect, useRef } from 'react'
import { Button, Icon, Navbar } from 'enchase'

import type { SidebarSection } from 'enchase'
import type { NavbarProps } from 'enchase'
import type { Meta, StoryObj } from '@storybook/react-vite'

const sections: SidebarSection[] = [
  {
    id: 'main',
    items: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'docs', label: 'Documentation', href: '/docs' },
      { id: 'api', label: 'API', href: '/api' }
    ]
  }
]

const cards = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth']

const vivid = 'linear-gradient(160deg, var(--enchase-color-primary), var(--enchase-color-error) 35%, var(--enchase-color-warning) 65%, var(--enchase-color-success))'

const BehindTheBar = (props: NavbarProps) => {
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scroller.current?.scrollTo({ top: 100 })
  }, [])

  return (
    <div ref={scroller} style={{ blockSize: '28rem', overflowY: 'auto', background: vivid }}>
      <Navbar {...props} />
      <div style={{ display: 'grid', gap: '1rem', padding: '1rem' }}>
        {cards.map((name) => (
          <div key={name} style={{ minBlockSize: '8rem', padding: '1rem', borderRadius: 'var(--enchase-radius-lg)', backgroundColor: 'var(--enchase-color-surface)', color: 'var(--enchase-color-text-primary)' }}>
            <strong>{name} card</strong>
            <p style={{ margin: 0 }}>Scroll this frame: the color and the borders that pass under the bar appear blurred, without making the menu hard to read.</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const meta = {
  title: 'Components/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A navigation bar at the top, with the brand, the links, actions and the theme button. Below the breakpoint, the links go into a drawer. With `translucent`, the background becomes semitransparent and blurs what scrolls underneath, and goes back to an opaque background when the system asks for less transparency or more contrast, in forced colors and in browsers without `backdrop-filter`.'
      }
    }
  },
  args: { logo: 'Enchase', sections },
  argTypes: {
    logo: { description: 'Brand shown on the left (or on the right in rtl). It accepts text or any React node, such as an image or an SVG. It is a link to logoHref (data-slot="navbar-logo").', control: 'text' },
    logoHref: { description: 'Destination of the brand link. It accepts a route, an anchor (#home) or a URL.', control: 'text', table: { defaultValue: { summary: '/' } } },
    breakpoint: {
      description: 'Breakpoint from which the links appear in the bar. Below it, the bar shows the menu button and the links go into the drawer. The values come from the UIProvider.',
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'xxl'],
      table: { defaultValue: { summary: 'md' } }
    },
    sections: {
      description: 'Items of the menu, in the same format as the Sidebar: [{ id, items: [{ id, label, href }] }]. Only the items with href appear, and the titles of the sections are not shown.',
      control: false
    },
    activeSectionId: {
      description: 'Id of the anchor item (href #id, or /page#id on the current page) marked as the current location (aria-current="location"). Use useScrollSpy to get it.',
      control: 'text'
    },
    actions: {
      description:
        'Actions next to the menu, such as a call-to-action button. On wide screens they stay in the bar, between the menu and the theme button (data-slot="navbar-cta"). On narrow screens they go into the drawer, below the links (data-slot="navbar-drawer-cta"), and a click on a link inside them closes the drawer. The node is rendered in one place at a time.',
      control: false
    },
    translucent: {
      description:
        'Makes the background of the bar semitransparent, blurring what passes behind it. The background comes from `--enchase-navbar-background` (default: the color `--enchase-navbar-background-solid`, which is the `surfaceContainer` of the theme, at `--enchase-navbar-background-alpha`, 0.8) and the blur from `--enchase-navbar-blur` (default `12px`), which you change in the `style` or in the CSS. With `prefers-reduced-transparency: reduce`, `prefers-contrast: more`, forced colors or without `backdrop-filter`, the background is opaque. With the default theme, the text of the brand and of the menu keeps 4.5:1 even over pure black or white (3:1 on the accent color of the brand on hover); check the contrast if you change the color or the theme.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    className: {
      description: 'Class of the header (`data-slot="navbar"`). The parts follow `data-slot="navbar-*"`; the mobile drawer is `navbar-drawer`, with `data-state`.',
      control: 'text'
    },
    style: { description: 'Style of the header.', control: false }
  }
} satisfies Meta<typeof Navbar>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithAction: Story = {
  args: { actions: <Button variant="primary">Get started</Button> }
}

export const LogoWithImage: Story = {
  args: {
    logo: (
      <>
        <Icon size={28}>
          <path d="M12 3 3 8v8l9 5 9-5V8z" />
        </Icon>{' '}
        Enchase
      </>
    ),
    logoHref: '#home'
  }
}

export const Translucent: Story = {
  args: { translucent: true, actions: <Button variant="primary">Get started</Button> },
  parameters: { docs: { description: { story: 'The frame is already scrolled: the colored background and the borders of the cards pass behind the bar, which blurs them and lets the color show through.' } } },
  render: (args) => <BehindTheBar {...args} />
}

export const CustomTranslucent: Story = {
  args: { translucent: true, style: { '--enchase-navbar-background': 'color-mix(in srgb, var(--enchase-color-primary-container) 55%, transparent)', '--enchase-navbar-blur': '24px' } as NavbarProps['style'] },
  parameters: { docs: { description: { story: 'The background color and the blur radius are set with the variables `--enchase-navbar-background` and `--enchase-navbar-blur`, here in the `style` of the bar.' } } },
  render: (args) => <BehindTheBar {...args} />
}

export const CustomHooks: Story = {
  args: { style: { '--enchase-navbar-menu-link-height': '46px' } as NavbarProps['style'] },
  parameters: {
    docs: {
      description: {
        story: 'The links of the horizontal menu are as tall as the hit target of the theme (`--enchase-hit-size`, 40 px by default), and never below 24 px. `--enchase-navbar-menu-link-height` sets their height on its own, without changing the target of the other controls or the height of the bar (`--enchase-navbar-bar-height`), and it is kept at 24 px or more as well. Here the links are 46 px tall, set in the `style` of the bar.'
      }
    }
  }
}
