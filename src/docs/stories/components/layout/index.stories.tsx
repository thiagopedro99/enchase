import { useEffect } from 'react'
import { Layout } from 'enchase'

import type { SidebarSection } from 'enchase'
import type { Meta, StoryObj } from '@storybook/react-vite'

const navigationSections: SidebarSection[] = [
  {
    id: 'main',
    title: 'Application',
    items: [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'components', label: 'Components', href: '/components' },
      { id: 'docs', label: 'Documentation', href: '/docs' }
    ]
  }
]

const pageSections: SidebarSection[] = [
  { id: 'guide', title: 'On this page', items: [{ id: 'usage', label: 'Usage', href: '#usage' }, { id: 'api', label: 'API', href: '#api' }] }
]

const vivid = 'linear-gradient(160deg, var(--enchase-color-primary), var(--enchase-color-error) 35%, var(--enchase-color-warning) 65%, var(--enchase-color-success))'

const cards = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth']

const ScrolledContent = () => {
  useEffect(() => {
    window.scrollTo({ top: 140 })
  }, [])

  return (
    <div style={{ display: 'grid', gap: '1rem', padding: '1rem', borderRadius: 'var(--enchase-radius-lg)', background: vivid }}>
      {cards.map((name) => (
        <div key={name} style={{ minBlockSize: '8rem', padding: '1rem', borderRadius: 'var(--enchase-radius-lg)', backgroundColor: 'var(--enchase-color-surface)', color: 'var(--enchase-color-text-primary)' }}>
          <strong>{name} card</strong>
          <p style={{ margin: 0 }}>Scroll the page: the color and the borders that pass under the top bar appear blurred.</p>
        </div>
      ))}
    </div>
  )
}

const meta = {
  title: 'Components/Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A page shell: a top bar with the breadcrumb trail and the side menu (permanent or drawer), or a `Navbar`; the content in `<main>` and the footer. It has no navigation, brand or footer of its own, and it does not change `document.title`.'
      }
    }
  },
  args: {
    pageTitle: 'Components',
    brand: 'Enchase',
    navigationSections,
    children: <h1>Page content</h1>
  },
  argTypes: {
    children: {
      description: 'Content of the page. It sits in `<main id="main-content">`, inside a `Container`, and it is the target of the skip-to-content link.',
      control: false
    },
    pageTitle: {
      description: 'Title of the page. It goes into the breadcrumb trail when no menu item matches the current page. The Layout does not change document.title.',
      control: 'text'
    },
    navigation: {
      description: 'sidebar shows the top bar with the menu button and the side menu. navbar shows the classic navigation bar at the top.',
      control: 'inline-radio',
      options: ['sidebar', 'navbar'],
      table: { defaultValue: { summary: 'sidebar' } }
    },
    translucent: {
      description:
        'Makes the top bar semitransparent, blurring the content that scrolls underneath: the `AppBar` with the sidebar navigation, or the `Navbar` with the navbar navigation. The background and the blur come from `--enchase-app-bar-background` and `--enchase-app-bar-blur` on the AppBar (default: the color `--enchase-app-bar-background-solid`, which is the `surface` of the theme, at `--enchase-app-bar-background-alpha`, 0.8, and `12px`) and from `--enchase-navbar-background` and `--enchase-navbar-blur` on the Navbar (the color `--enchase-navbar-background-solid`, which is the `surfaceContainer`, at `--enchase-navbar-background-alpha`). With `prefers-reduced-transparency: reduce`, `prefers-contrast: more`, forced colors or without `backdrop-filter`, the background is opaque.',
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } }
    },
    breakpoint: {
      description: 'Breakpoint at which the sidebar stops being a drawer and becomes permanent. The values come from the UIProvider.',
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'xxl'],
      table: { defaultValue: { summary: 'md' } }
    },
    maxWidth: { description: 'Maximum width of the content, taken from the breakpoints.', control: 'select', options: ['sm', 'md', 'lg', 'xl', 'xxl', 'full'] },
    padding: {
      description: 'Side spacing of the content, as in the Container: true uses the default, false removes it, and a CSS string sets the value.',
      control: 'text'
    },
    centered: { description: 'Centers the content vertically.', control: 'boolean' },
    hideNavbar: { description: 'Hides the navigation (the top bar, the sidebar and the navbar).', control: 'boolean' },
    hideFooter: { description: 'Hides the footer.', control: 'boolean' },
    brand: {
      description: 'Name of the brand. At the top of the sidebar it is a link to the site root, with the first letter of the name in place of the image; with navigation="navbar" it becomes the logo of the Navbar.',
      control: 'text'
    },
    brandLogo: {
      description: 'URL of an image for the brand of the sidebar, in place of the first letter of the name. The image is decorative, and the name stays as text.',
      control: 'text'
    },
    footerProps: { description: 'companyName, notice, year and links of the footer.', control: 'object' },
    sidebarFooter: {
      description: 'Fixed content in the footer of the sidebar, above the collapse button. It can be a function that receives { collapsed }.',
      control: false
    },
    navigationSections: {
      description: 'Sections of the main menu, as in Sidebar: [{ id, title?, items: [{ id, label, href?, native?, icon?, badge?, onClick? }] }].',
      control: false
    },
    pageSections: { description: 'Anchor sections added to the menu.', control: false },
    activePageSectionId: {
      description: 'Id of the anchor item that is on screen (use useScrollSpy): it is marked in the menu (aria-current="location") and becomes the last item of the breadcrumb trail.',
      control: 'text'
    },
    breadcrumbs: { description: 'Explicit breadcrumb trail. Without it, the Layout derives the trail from the menu and the current page.', control: false },
    collapsed: {
      description: 'Collapsed sidebar, controlled from the outside together with onCollapsedChange. Without it, the state is internal (defaultCollapsed) and can be saved with storageKey.',
      control: 'boolean'
    },
    defaultCollapsed: { description: 'Initial state of the collapsed sidebar. collapsed and onCollapsedChange control it from the outside.', control: 'boolean' },
    onCollapsedChange: { description: 'Called with the new value when the sidebar is collapsed or expanded.', control: false },
    storageKey: { description: 'Saves the collapsed state in localStorage under this name, read only after mounting. Ignored when collapsed is controlled.', control: 'text' },
    open: {
      description: 'Menu drawer on narrow screens (below the breakpoint), controlled from the outside together with onOpenChange. Without it, the state is internal (defaultOpen).',
      control: 'boolean'
    },
    defaultOpen: { description: 'Initial state of the drawer when it is not controlled.', control: 'boolean' },
    onOpenChange: { description: 'Called with the new value when the drawer opens or closes.', control: false },
    className: { description: 'Class of the root (data-slot="layout").', control: 'text' },
    style: { description: 'Style of the root.', control: false }
  }
} satisfies Meta<typeof Layout>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithNavbar: Story = {
  args: { navigation: 'navbar' }
}

export const CollapsedSidebar: Story = {
  args: { defaultCollapsed: true }
}

export const WithPageSections: Story = {
  args: { pageSections, activePageSectionId: 'usage' }
}

export const WithFooter: Story = {
  args: { footerProps: { companyName: 'Enchase', notice: 'MIT License.' } }
}

export const TranslucentSidebar: Story = {
  args: { translucent: true, children: <ScrolledContent /> },
  parameters: { docs: { story: { inline: false, iframeHeight: 520 }, description: { story: 'The translucent `AppBar` with the sidebar navigation: the page is already scrolled, and the color that passes under the bar appears blurred.' } } }
}

export const TranslucentNavbar: Story = {
  args: { navigation: 'navbar', translucent: true, children: <ScrolledContent /> },
  parameters: { docs: { story: { inline: false, iframeHeight: 520 }, description: { story: 'The translucent `Navbar` with the navbar navigation. The bar stays fixed at the top while the page scrolls.' } } }
}
