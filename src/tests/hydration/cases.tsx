import { HomeIcon } from '@components/common/Icon/icons/HomeIcon.tsx'

import { ColorModeProvider, ColorModeScript } from '@components/colorMode/index.tsx'
import { Checkbox } from '@components/common/Checkbox/index.tsx'
import ThemeToggle from '@components/common/ThemeToggle/index.tsx'
import { Breadcrumbs } from '@components/common/Breadcrumbs/index.tsx'
import { InlineLoading, Loading } from '@components/common/Loading/index.tsx'
import { Skeleton } from '@components/common/Skeleton/index.tsx'
import { Tooltip } from '@components/common/Tooltip/index.tsx'
import { Popover } from '@components/common/Popover/index.tsx'
import { ConfirmModal, Modal } from '@components/common/Modal/index.tsx'
import { Sidebar } from '@components/common/Sidebar/index.tsx'
import { Select } from '@components/common/Select/index.tsx'
import { Button } from '@components/common/Button/index.tsx'
import { Textarea } from '@components/common/Textarea/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Badge } from '@components/common/Badge/index.tsx'
import { Card } from '@components/common/Card/index.tsx'
import { ToastProvider } from '@components/toast/index.ts'
import UIProvider from '@components/uiProvider/index.tsx'
import { SidebarUser } from '@components/layout/subcomponentes/SidebarUser/index.tsx'
import Layout from '@components/layout/index.tsx'
import Navbar from '@components/navbar/index.tsx'
import Footer from '@components/footer/index.tsx'

import type { SidebarSection } from '@components/common/Sidebar/types.ts'
import type { ReactElement, ReactNode } from 'react'

const noop = () => undefined

const sections: SidebarSection[] = [
  {
    id: 'main',
    title: 'Navigation',
    items: [
      { id: 'home', label: 'Home', icon: <HomeIcon />, href: '/' },
      { id: 'docs', label: 'Docs', href: '/docs' }
    ]
  }
]

export type HydrationCase = { name: string; element: ReactElement; bare?: boolean }

export const hydrationCases: HydrationCase[] = [
  { name: 'Button', element: <Button>Send</Button> },
  { name: 'Input', element: <Input label="Email" type="password" /> },
  { name: 'Textarea', element: <Textarea label="Message" helperText="Tell us more" /> },
  { name: 'Select', element: <Select label="Country" placeholder="Choose" options={[{ value: 'br', label: 'Brazil' }]} /> },
  { name: 'Checkbox', element: <Checkbox label="Accept" /> },
  { name: 'Card', element: <Card variant="elevated">Content</Card> },
  { name: 'Badge', element: <Badge variant="success">New</Badge> },
  { name: 'Tooltip', element: <Tooltip text="Help"><Button>Hover</Button></Tooltip> },
  { name: 'ThemeToggle', element: <ThemeToggle /> },
  { name: 'Popover closed', element: <Popover content={<p>Details</p>}><Button>Open</Button></Popover> },
  { name: 'Popover open', element: <Popover defaultOpen arrow label="Details" content={<p>Details</p>}><Button>Open</Button></Popover> },
  { name: 'Modal closed', element: <Modal isOpen={false} onClose={noop} title="Title">Body</Modal> },
  { name: 'Modal open', element: <Modal isOpen onClose={noop} title="Title">Body</Modal> },
  { name: 'ConfirmModal open', element: <ConfirmModal isOpen onClose={noop} onConfirm={noop} message="Are you sure?" /> },
  { name: 'Loading overlay', element: <Loading overlay text="Loading" /> },
  { name: 'Loading inline', element: <InlineLoading label="Loading" /> },
  { name: 'Skeleton', element: <Skeleton /> },
  { name: 'Breadcrumbs', element: <Breadcrumbs items={[{ id: 'home', label: 'Home', href: '/' }, { id: 'page', label: 'Page' }]} /> },
  { name: 'Sidebar permanent', element: <Sidebar sections={sections} /> },
  { name: 'Sidebar modal open', element: <Sidebar variant="modal" open onClose={noop} sections={sections} /> },
  { name: 'SidebarUser', element: <SidebarUser name="Pedro Lima" collapsed={false} onLogout={noop} /> },
  { name: 'Navbar', element: <Navbar logo="Logo" /> },
  { name: 'Footer', element: <Footer /> },
  { name: 'Layout', element: <Layout pageTitle="Home"><p>Content</p></Layout> },
  { name: 'Layout navbar', element: <Layout navigation="navbar" pageTitle="Home"><p>Content</p></Layout> },
  { name: 'Layout collapsed with storage', element: <Layout storageKey="hydration-layout" defaultCollapsed pageTitle="Home"><p>Content</p></Layout> },
  { name: 'Providers only', element: <p>Content</p> },
  { name: 'ColorModeProvider alone', element: <ColorModeProvider><p>Content</p></ColorModeProvider>, bare: true },
  { name: 'ColorModeProvider with script and layer', element: <ColorModeProvider cssLayer="enchase-theme"><ColorModeScript /><p>Content</p></ColorModeProvider>, bare: true }
]

export const withProviders = ({ element, bare }: HydrationCase): ReactNode =>
  bare ? (
    element
  ) : (
    <ColorModeProvider>
      <UIProvider>
        <ToastProvider>{element}</ToastProvider>
      </UIProvider>
    </ColorModeProvider>
  )
