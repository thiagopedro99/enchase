import { HomeIcon } from '@tests/shared/fixtures/exampleIcons.tsx'

import { shadcn } from '@styles/presets/shadcn.ts'

import { SidebarUser } from '@components/layout/subcomponentes/SidebarUser/index.tsx'
import { ColorModeProvider, ColorModeScript } from '@components/colorMode/index.tsx'
import { ChevronLeftIcon } from '@components/common/Icon/icons/ChevronLeftIcon.tsx'
import { InlineLoading, Loading } from '@components/common/Loading/index.tsx'
import { ConfirmModal, Modal } from '@components/common/Modal/index.tsx'
import { CloseIcon } from '@components/common/Icon/icons/CloseIcon.tsx'
import { NumberInput } from '@components/common/NumberInput/index.tsx'
import { Breadcrumbs } from '@components/common/Breadcrumbs/index.tsx'
import { RadioGroup } from '@components/common/RadioGroup/index.tsx'
import { SegmentedControl } from '@components/common/SegmentedControl/index.tsx'
import { Pagination } from '@components/common/Pagination/index.tsx'
import { Accordion } from '@components/common/Accordion/index.tsx'
import ThemeToggle from '@components/common/ThemeToggle/index.tsx'
import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { CheckboxGroup } from '@components/common/CheckboxGroup/index.tsx'
import { Combobox } from '@components/common/Combobox/index.tsx'
import { DatePicker } from '@components/common/DatePicker/index.tsx'
import { Skeleton } from '@components/common/Skeleton/index.tsx'
import { Slider } from '@components/common/Slider/index.tsx'
import { Textarea } from '@components/common/Textarea/index.tsx'
import { Tooltip } from '@components/common/Tooltip/index.tsx'
import { Popover } from '@components/common/Popover/index.tsx'
import { Sidebar } from '@components/common/Sidebar/index.tsx'
import { Switch } from '@components/common/Switch/index.tsx'
import { Select } from '@components/common/Select/index.tsx'
import { Button } from '@components/common/Button/index.tsx'
import { Table } from '@components/common/Table/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Divider } from '@components/common/Divider/index.tsx'
import { Drawer } from '@components/common/Drawer/index.tsx'
import { Menu } from '@components/common/Menu/index.tsx'
import { Avatar } from '@components/common/Avatar/index.tsx'
import { Tag } from '@components/common/Tag/index.tsx'
import { Progress } from '@components/common/Progress/index.tsx'
import { Badge } from '@components/common/Badge/index.tsx'
import { Alert } from '@components/common/Alert/index.tsx'
import { ToastProvider } from '@components/toast/index.ts'
import UIProvider from '@components/uiProvider/index.tsx'
import { Tabs } from '@components/common/Tabs/index.tsx'
import { CardButton } from '@components/common/CardButton/index.tsx'
import { CardLink } from '@components/common/CardLink/index.tsx'
import { Card } from '@components/common/Card/index.tsx'
import { Flex } from '@components/common/Flex/index.tsx'
import { Grid } from '@components/common/Grid/index.tsx'
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
  { name: 'Combobox', element: <Combobox label="Country" placeholder="Choose" helperText="Type to filter" options={[{ value: 'br', label: 'Brazil' }, { value: 'pt', label: 'Portugal', disabled: true }]} defaultValue="br" /> },
  { name: 'Combobox with several choices', element: <Combobox multiple label="Countries" name="countries" options={[{ value: 'br', label: 'Brazil' }, { value: 'pt', label: 'Portugal' }]} defaultValue={['br', 'pt']} error="Choose at most one" loading /> },
  { name: 'Combobox that starts open', element: <Combobox label="Country" defaultOpen options={[{ value: 'br', label: 'Brazil' }]} /> },
  { name: 'DatePicker', element: <DatePicker label="Birthday" name="birthday" helperText="Type it or open the calendar" defaultValue="2026-10-28" min="2026-01-01" max="2026-12-31" /> },
  { name: 'DatePicker that starts open', element: <DatePicker label="Date" defaultOpen defaultValue="2026-10-28" error="Choose another date" /> },
  { name: 'DatePicker with a language of its own', element: <DatePicker label="Date" locale="en-CA" defaultValue="2026-10-28" /> },
  { name: 'Checkbox', element: <Checkbox label="Accept" /> },
  { name: 'Checkbox that is indeterminate', element: <Checkbox label="Select all" indeterminate defaultChecked /> },
  { name: 'Checkbox with an error', element: <Checkbox label="Accept" error="Accept the terms to continue" /> },
  { name: 'Checkbox with a helper text', element: <Checkbox label="Accept" helperText="You can read the terms first" id="terms" /> },
  { name: 'Switch', element: <Switch label="Notifications" defaultChecked /> },
  { name: 'Switch with an error', element: <Switch label="Notifications" error="Turn notifications on to continue" /> },
  { name: 'Switch with a helper text', element: <Switch label="Notifications" helperText="One summary a day" defaultChecked /> },
  { name: 'Table', element: <Table caption="Orders" striped columns={[{ key: 'id', header: 'Order', rowHeader: true }, { key: 'total', header: 'Total', align: 'end' }]} rows={[{ id: '#1', total: 10 }, { id: '#2', total: 20 }]} /> },
  { name: 'Table that sorts, sticks and loads', element: <Table caption="Orders" stickyHeader sort={{ key: 'total', direction: 'descending' }} onSortChange={noop} columns={[{ key: 'id', header: <abbr title="Order number">No.</abbr>, rowHeader: true, sortable: true }, { key: 'total', header: 'Total', align: 'end', sortable: true }]} rows={[{ id: '#1', total: 10 }, { id: '#2', total: 20 }]} loading /> },
  { name: 'Table with row selection', element: <Table caption="Orders" selectedKeys={['#1']} onSelectedKeysChange={noop} getRowKey={(row) => row.id} columns={[{ key: 'id', header: 'Order', rowHeader: true }, { key: 'total', header: 'Total', align: 'end' }]} rows={[{ id: '#1', total: 10 }, { id: '#2', total: 20 }]} /> },
  { name: 'Table with row selection while it loads', element: <Table caption="Orders" selectedKeys={[]} onSelectedKeysChange={noop} columns={[{ key: 'id', header: 'Order', rowHeader: true }, { key: 'total', header: 'Total', align: 'end' }]} rows={[{ id: '#1', total: 10 }]} loading /> },
  { name: 'Table that sorts', element: <Table caption="Orders" sort={{ key: 'id', direction: 'ascending' }} onSortChange={noop} columns={[{ key: 'id', header: 'Order', rowHeader: true, sortable: true }, { key: 'total', header: 'Total', align: 'end' }]} rows={[{ id: '#1', total: 10 }, { id: '#2', total: 20 }]} loading={false} /> },
  { name: 'Pagination', element: <Pagination pageCount={12} defaultPage={6} size="sm" /> },
  { name: 'Icons', element: <div><CloseIcon /><ChevronLeftIcon title="Back" size={20} /></div> },
  { name: 'NumberInput', element: <NumberInput label="Price" name="price" defaultValue={1234.5} min={0} formatOptions={{ style: 'currency', currency: 'BRL' }} helperText="In reais" /> },
  { name: 'NumberInput with a language of its own', element: <NumberInput label="Price" locale="de" defaultValue={1234.5} formatOptions={{ style: 'currency', currency: 'EUR' }} /> },
  { name: 'Accordion', element: <Accordion defaultValue={['b']} items={[{ value: 'a', title: 'First', content: <p>One</p> }, { value: 'b', title: 'Second', content: <p>Two</p> }, { value: 'c', title: 'Third', content: <p>Three</p>, disabled: true }]} /> },
  { name: 'Tabs', element: <Tabs ariaLabel="Sections" defaultValue="b" items={[{ value: 'a', label: 'First', content: <p>One</p> }, { value: 'b', label: 'Second', content: <p>Two</p> }, { value: 'c', label: 'Third', content: <p>Three</p>, disabled: true }]} /> },
  { name: 'RadioGroup', element: <RadioGroup label="Plan" defaultValue="pro" helperText="Billed monthly" options={[{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }]} /> },
  { name: 'CheckboxGroup', element: <CheckboxGroup label="Topics" defaultValue={['news']} helperText="Pick what you like" options={[{ value: 'news', label: 'News' }, { value: 'offers', label: 'Offers', disabled: true }]} /> },
  { name: 'CheckboxGroup with an error', element: <CheckboxGroup label="Topics" value={['offers']} onValueChange={noop} error="Pick at least one" orientation="horizontal" options={[{ value: 'news', label: 'News' }, { value: 'offers', label: 'Offers' }]} /> },
  { name: 'SegmentedControl', element: <SegmentedControl ariaLabel="View" defaultValue="board" size="sm" items={[{ value: 'list', label: 'List' }, { value: 'board', label: 'Board' }, { value: 'old', label: 'Old', disabled: true }]} /> },
  { name: 'SegmentedControl that chooses several', element: <SegmentedControl multiple fullWidth ariaLabel="Days" value={['mon']} onValueChange={noop} items={[{ value: 'mon', label: 'Mon' }, { value: 'tue', label: 'Tue' }]} /> },
  { name: 'Slider', element: <Slider label="Volume" showValue defaultValue={30} name="volume" formatValue={(value) => `${value}%`} /> },
  { name: 'Slider that is disabled', element: <Slider ariaLabel="Brightness" min={0} max={1} step={0.1} value={0.4} onValueChange={noop} disabled /> },
  { name: 'Card', element: <Card variant="elevated">Content</Card> },
  { name: 'Grid', element: <Grid columns={{ xs: 1, md: 3 }} centerLastRow><p>One</p><p>Two</p><p>Three</p><p>Four</p></Grid> },
  { name: 'CardButton', element: <CardButton variant="elevated"><span>Open</span></CardButton> },
  { name: 'CardButton disabled', element: <CardButton disabled variant="outlined">Soon</CardButton> },
  { name: 'CardLink', element: <CardLink href="/projects" variant="outlined">Projects</CardLink> },
  { name: 'CardLink new tab', element: <CardLink href="https://example.com" target="_blank">Site</CardLink> },
  { name: 'Grid as a list of tiles', element: <Grid as="ul" columns={2} aria-label="Projects"><li><CardLink href="/a">One</CardLink></li><li><CardButton>Two</CardButton></li></Grid> },
  { name: 'Grid as a list of cards', element: <Grid as="ul" columns={2} aria-label="Projects"><Card as="li">One</Card><Card as="li" variant="elevated">Two</Card></Grid> },
  { name: 'Flex as a list of badges', element: <Flex as="ul" wrap aria-label="Stack"><li><Badge>One</Badge></li><li><Badge variant="success">Two</Badge></li></Flex> },
  { name: 'Badge', element: <Badge variant="success">New</Badge> },
  { name: 'Tag static and removable', element: <Flex wrap gap="0.5rem"><Tag>React</Tag><Tag size="sm" onRemove={noop}>TypeScript</Tag><Tag onRemove={noop}>Vite</Tag></Flex> },
  { name: 'Progress in every shape', element: <Flex direction="column" gap="0.5rem"><Progress value={40} aria-label="Linear" /><Progress aria-label="Linear indeterminate" /><Progress variant="circular" value={40} aria-label="Circular" /><Progress variant="circular" size="lg" aria-label="Circular indeterminate" /></Flex> },
  { name: 'Avatar', element: <Flex><Avatar name="Ana Souza" /><Avatar name="Ana Souza" src="/ana.png" size="lg" /><Avatar size="sm" /></Flex> },
  { name: 'Divider', element: <Flex><span>One</span><Divider orientation="vertical" /><span>Two</span><Divider decorative /></Flex> },
  { name: 'Alert', element: <Alert variant="warning" title="Heads up" onClose={noop}>The deadline is today.</Alert> },
  { name: 'Tooltip', element: <Tooltip text="Help"><Button>Hover</Button></Tooltip> },
  { name: 'ThemeToggle', element: <ThemeToggle /> },
  { name: 'Popover closed', element: <Popover content={<p>Details</p>}><Button>Open</Button></Popover> },
  { name: 'Popover open', element: <Popover defaultOpen arrow label="Details" content={<p>Details</p>}><Button>Open</Button></Popover> },
  { name: 'Modal closed', element: <Modal isOpen={false} onClose={noop} title="Title">Body</Modal> },
  { name: 'Modal open', element: <Modal isOpen onClose={noop} title="Title">Body</Modal> },
  { name: 'ConfirmModal open', element: <ConfirmModal isOpen onClose={noop} onConfirm={noop} message="Are you sure?" /> },
  { name: 'Drawer closed', element: <Drawer open={false} onClose={noop} title="Menu">Body</Drawer> },
  { name: 'Drawer open', element: <Drawer open onClose={noop} title="Menu" side="end" size="lg" footer={<Button>Apply</Button>}>Body</Drawer> },
  { name: 'Menu closed', element: <Menu label="Actions" items={[{ id: 'edit', label: 'Edit' }]}><Button>Actions</Button></Menu> },
  { name: 'Menu open', element: <Menu open label="Actions" items={[{ id: 'edit', label: 'Edit' }, { id: 'sep', separator: true }, { id: 'delete', label: 'Delete', disabled: true }]}><Button>Actions</Button></Menu> },
  { name: 'Loading overlay', element: <Loading overlay text="Loading" /> },
  { name: 'Loading inline', element: <InlineLoading label="Loading" /> },
  { name: 'Skeleton', element: <Skeleton /> },
  { name: 'Breadcrumbs', element: <Breadcrumbs items={[{ id: 'home', label: 'Home', href: '/' }, { id: 'page', label: 'Page' }]} /> },
  { name: 'Sidebar permanent', element: <Sidebar sections={sections} /> },
  { name: 'Sidebar modal open', element: <Sidebar variant="modal" open onClose={noop} sections={sections} /> },
  { name: 'SidebarUser', element: <SidebarUser name="Pedro Lima" collapsed={false} onLogout={noop} /> },
  { name: 'Navbar', element: <Navbar logo="Logo" /> },
  { name: 'Navbar translucent', element: <Navbar logo="Logo" translucent /> },
  { name: 'Footer', element: <Footer /> },
  { name: 'Layout', element: <Layout pageTitle="Home"><p>Content</p></Layout> },
  { name: 'Layout navbar', element: <Layout navigation="navbar" pageTitle="Home"><p>Content</p></Layout> },
  { name: 'Layout translucent', element: <Layout translucent pageTitle="Home"><p>Content</p></Layout> },
  { name: 'Layout navbar translucent', element: <Layout navigation="navbar" translucent pageTitle="Home"><p>Content</p></Layout> },
  { name: 'Layout collapsed with storage', element: <Layout storageKey="hydration-layout" defaultCollapsed pageTitle="Home"><p>Content</p></Layout> },
  { name: 'Providers only', element: <p>Content</p> },
  { name: 'ColorModeProvider alone', element: <ColorModeProvider><p>Content</p></ColorModeProvider>, bare: true },
  {
    name: 'ColorModeProvider with the shadcn style and its stacked labels',
    element: (
      <ColorModeProvider theme={{ style: shadcn }}>
        <Input label="Email" helperText="Never shared" />
        <NumberInput label="Amount" defaultValue={3} />
        <Select label="Country" placeholder="Choose" options={[{ value: 'br', label: 'Brazil' }]} />
        <Textarea label="Message" error="Too short" />
        <Input label="Floating" labelPlacement="floating" />
      </ColorModeProvider>
    ),
    bare: true
  },
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
