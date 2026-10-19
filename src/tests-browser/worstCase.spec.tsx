import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Breadcrumbs } from '@components/common/Breadcrumbs/index.tsx'
import { Pagination } from '@components/common/Pagination/index.tsx'
import { Table } from '@components/common/Table/index.tsx'
import { Accordion } from '@components/common/Accordion/index.tsx'
import { Button } from '@components/common/Button/index.tsx'
import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { NumberInput } from '@components/common/NumberInput/index.tsx'
import { Popover } from '@components/common/Popover/index.tsx'
import { RadioGroup } from '@components/common/RadioGroup/index.tsx'
import { Select } from '@components/common/Select/index.tsx'
import { Switch } from '@components/common/Switch/index.tsx'
import { Textarea } from '@components/common/Textarea/index.tsx'
import { Tabs } from '@components/common/Tabs/index.tsx'
import { Sidebar } from '@components/common/Sidebar/index.tsx'
import { Tooltip } from '@components/common/Tooltip/index.tsx'
import { ToastProvider, useToast } from '@components/toast/index.ts'
import Footer from '@components/footer/index.tsx'
import Layout from '@components/layout/index.tsx'
import { SidebarUser } from '@components/layout/subcomponentes/SidebarUser/index.tsx'
import Navbar from '@components/navbar/index.tsx'
import { worstCase, worstLabels } from '@tests/shared/fixtures/worstCase.ts'
import { renderInBrowser } from './harness.tsx'

import type { SidebarSection } from '@components/common/Sidebar/types.ts'
import type { ReactElement } from 'react'

const widths = [320, 1280] as const

const longSections: SidebarSection[] = [
  {
    id: 'worst',
    title: worstCase.longTitle,
    items: [
      { id: 'a', label: worstCase.germanCompound, href: '/a', badge: worstCase.longStatus },
      { id: 'b', label: worstCase.frenchLabel, href: '/b' },
      { id: 'c', label: worstCase.longEmail, href: '/c' },
      { id: 'd', label: worstCase.shortName, href: '/d' },
      { id: 'e', label: worstCase.emojiName, href: '/e' },
      { id: 'f', label: worstCase.arabicName, href: '/f' }
    ]
  }
]

const lonelySurrogate = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/

const isHidden = (element: Element) => element.closest('[data-slot="visually-hidden"], [hidden], [inert], [aria-hidden="true"]') !== null

const controls = () =>
  [...document.querySelectorAll<HTMLElement>('button, select, input:not([type="checkbox"]), [role="checkbox"], a[href]')].filter((element) => {
    const box = element.getBoundingClientRect()

    return box.width > 1 && box.height > 1 && !isHidden(element) && element.getAttribute('data-slot') !== 'layout-skip-link'
  })

const audit = (label: string) => {
  const failures: string[] = []
  const root = document.documentElement

  if (root.scrollWidth - root.clientWidth > 1) failures.push(`${label}: horizontal overflow (${root.scrollWidth} > ${root.clientWidth})`)

  for (const control of controls()) {
    const box = control.getBoundingClientRect()
    const inline = control.tagName === 'A' && getComputedStyle(control).display === 'inline'

    if (!inline && (box.width < 24 || box.height < 24)) failures.push(`${label}: target ${Math.round(box.width)}x${Math.round(box.height)} <${control.tagName.toLowerCase()} ${control.dataset.slot ?? ''}>`)
  }

  for (const icon of document.querySelectorAll<SVGElement>('svg[data-icon]')) {
    if (getComputedStyle(icon).flexShrink !== '0') failures.push(`${label}: icon ${icon.dataset.icon} can shrink in a flex row`)
  }

  for (const word of ['NaN', 'undefined', 'null']) if (document.body.innerText.includes(word)) failures.push(`${label}: renders "${word}"`)

  return failures
}

const insideViewport = (element: Element | null, label: string) => {
  expect(element, label).toBeTruthy()
  const box = (element as Element).getBoundingClientRect()

  expect(box.left, `${label} left`).toBeGreaterThanOrEqual(-0.5)
  expect(box.right, `${label} right`).toBeLessThanOrEqual(document.documentElement.clientWidth + 0.5)
  expect(box.top, `${label} top`).toBeGreaterThanOrEqual(-0.5)
  expect(box.bottom, `${label} bottom`).toBeLessThanOrEqual(window.innerHeight + 0.5)
}

afterEach(async () => {
  await page.viewport(1280, 800)
})

const ToastLauncher = () => {
  const toast = useToast()

  return (
    <button style={{ padding: '8px 16px' }} onClick={() => toast.error(`Falhou para ${worstCase.longEmail} em ${worstCase.longUrl}`, 60000)}>
      avisar
    </button>
  )
}

const ModalLauncher = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title={`${worstCase.longTitle} ${worstCase.uuid}`}>
        <p>{worstCase.longUrl}</p>
        <p>{worstCase.fileName}</p>
      </Modal>
    </>
  )
}

describe.each(widths)('worst case data at %ipx', (width) => {
  const setup = async (ui: ReactElement) => {
    await page.viewport(width, 800)
    renderInBrowser(ui)
  }

  it('keeps buttons inside the page whatever the label', async () => {
    await setup(
      <div style={{ display: 'grid', gap: 8 }}>
        {worstLabels.map((label) => (
          <div key={label}>
            <Button>{label}</Button>
            <Button size="sm" variant="outline">
              {label}
            </Button>
            <Button size="lg" fullWidth>
              {label}
            </Button>
          </div>
        ))}
      </div>
    )

    expect(audit(`buttons@${width}`).join(' | ')).toBe('')
  })

  it('keeps the fields inside the page with long labels and values', async () => {
    await setup(
      <div style={{ display: 'grid', gap: 12 }}>
        <Input label={worstCase.frenchLabel} defaultValue={worstCase.longEmail} helperText={worstCase.longUrl} />
        <Input label={worstCase.germanCompound} type="password" defaultValue={worstCase.uuid} />
        <Select label={worstCase.frenchLabel} defaultValue="a" options={[{ value: 'a', label: worstCase.longTitle }, { value: 'b', label: worstCase.fileName }]} />
        <Checkbox label={`${worstCase.frenchLabel} ${worstCase.longEmail}`} />
        <Checkbox label={worstCase.shortName} />
        <Switch label={`${worstCase.frenchLabel} ${worstCase.longEmail}`} />
        <Switch label={worstCase.shortName} />
        <RadioGroup label={worstCase.germanCompound} helperText={worstCase.longUrl} options={[{ value: 'a', label: `${worstCase.frenchLabel} ${worstCase.longEmail}` }, { value: 'b', label: worstCase.shortName }]} />
        <RadioGroup label={worstCase.longTitle} error={worstCase.longUrl} orientation="horizontal" options={[{ value: 'a', label: worstCase.longEmail }, { value: 'b', label: worstCase.fileName }]} />
      </div>
    )

    expect(audit(`fields@${width}`).join(' | ')).toBe('')
  })

  it('keeps the outline of a field inside the page when its label is longer than the field', async () => {
    await setup(
      <div style={{ display: 'grid', gap: 12 }}>
        <Input label={worstCase.longTitle} />
        <Textarea label={worstCase.longTitle} />
        <Select label={worstCase.longTitle} options={[{ value: 'a', label: worstCase.shortName }]} />
        <NumberInput label={worstCase.longTitle} />
      </div>
    )

    expect(audit(`long labels@${width}`).join(' | ')).toBe('')
  })

  it('keeps the number fields inside the page with long labels, long messages and huge numbers', async () => {
    await setup(
      <div style={{ display: 'grid', gap: 12 }}>
        <NumberInput label={worstCase.longTitle} defaultValue={Number.MAX_SAFE_INTEGER} helperText={worstCase.longUrl} />
        <NumberInput label={worstCase.germanCompound} defaultValue={123456789.123456} error={worstCase.longEmail} formatOptions={{ style: 'currency', currency: 'BRL' }} fullWidth />
        <NumberInput label={worstCase.frenchLabel} defaultValue={1e21} min={0} />
        <NumberInput label={worstCase.shortName} defaultValue={-0.000001} formatOptions={{ maximumFractionDigits: 6 }} steppers={false} />
      </div>
    )

    expect(audit(`number fields@${width}`).join(' | ')).toBe('')
  })

  it('keeps the tabs inside the page and scrolls the list when the labels do not fit', async () => {
    await setup(<Tabs ariaLabel="Pior caso" items={worstLabels.map((label) => ({ value: label, label, content: <p>{`${worstCase.longTitle} ${worstCase.fileName}`}</p> }))} />)
    const list = document.querySelector('[data-slot="tabs-list"]') as HTMLElement

    expect(audit(`tabs@${width}`).join(' | ')).toBe('')
    expect(list.scrollWidth).toBeGreaterThan(list.clientWidth)
  })

  it('keeps the accordion inside the page with long titles and content', async () => {
    await setup(<Accordion multiple defaultValue={worstLabels} items={worstLabels.map((label) => ({ value: label, title: label, content: <p>{`${worstCase.longTitle} ${worstCase.fileName}`}</p> }))} />)

    expect(audit(`accordion@${width}`).join(' | ')).toBe('')
  })

  it('keeps the pagination inside the page with many large page numbers', async () => {
    await setup(<Pagination pageCount={999999} defaultPage={500000} siblingCount={2} boundaryCount={2} />)

    expect(audit(`pagination@${width}`).join(' | ')).toBe('')
  })

  it('keeps the table inside the page with long values and scrolls its box instead', async () => {
    await setup(
      <Table
        caption={worstCase.longTitle}
        columns={[
          { key: 'name', header: worstCase.germanCompound },
          { key: 'email', header: 'E-mail' },
          { key: 'file', header: 'Arquivo' },
          { key: 'url', header: 'Endereço' }
        ]}
        rows={[
          { name: worstCase.longName, email: worstCase.longEmail, file: worstCase.fileName, url: worstCase.longUrl },
          { name: worstCase.thaiName, email: worstCase.uuid, file: worstCase.longTag, url: worstCase.longStatus }
        ]}
      />
    )
    const box = document.querySelector('[data-slot="table"]') as HTMLElement

    expect(audit(`table@${width}`).join(' | ')).toBe('')
    if (width === 320) expect(box.scrollWidth).toBeGreaterThan(box.clientWidth)
    expect(box.getBoundingClientRect().right).toBeLessThanOrEqual(document.documentElement.clientWidth + 0.5)
  })

  it('keeps the breadcrumbs inside the page', async () => {
    await setup(
      <Breadcrumbs
        items={[
          { id: 'home', label: worstCase.germanCompound, href: '/' },
          { id: 'a', label: worstCase.frenchLabel, href: '/a' },
          { id: 'b', label: worstCase.longEmail, href: '/b' },
          { id: 'c', label: worstCase.fileName, href: '/c' },
          { id: 'd', label: worstCase.longTitle }
        ]}
      />
    )

    expect(audit(`breadcrumbs@${width}`).join(' | ')).toBe('')
  })

  it('keeps the sidebar items readable and inside the column', async () => {
    await setup(
      <div style={{ display: 'flex', minHeight: 600 }}>
        <Sidebar sections={longSections} />
      </div>
    )
    const aside = document.querySelector('[data-slot="sidebar"]') as HTMLElement

    for (const item of document.querySelectorAll<HTMLElement>('[data-slot="sidebar-item-control"]')) {
      expect(item.getBoundingClientRect().right, item.textContent ?? '').toBeLessThanOrEqual(aside.getBoundingClientRect().right + 0.5)
    }
    expect(audit(`sidebar@${width}`).join(' | ')).toBe('')
  })

  it('keeps the layout shell inside the page with a long brand and long navigation', async () => {
    await setup(
      <Layout brand={worstCase.longTitle} navigationSections={longSections} footerProps={{ companyName: worstCase.longTitle, notice: worstCase.longUrl }}>
        <h1>{worstCase.longTitle}</h1>
        <p>{worstCase.longEmail}</p>
      </Layout>
    )

    expect(audit(`layout@${width}`).join(' | ')).toBe('')
  })

  it('keeps the navbar inside the page', async () => {
    await setup(<Navbar logo={worstCase.longTitle} sections={longSections} />)

    expect(audit(`navbar@${width}`).join(' | ')).toBe('')
  })

  it('keeps the modal inside the viewport and its close button reachable', async () => {
    await setup(<ModalLauncher />)
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(() => document.querySelector('[data-slot="modal-close"]')).toBeTruthy()

    insideViewport(document.querySelector('[data-slot="modal-close"]'), 'modal close')
    insideViewport(document.querySelector('[data-slot="modal-panel"]'), 'modal panel')
    expect(audit(`modal@${width}`).join(' | ')).toBe('')
  })

  it('keeps a long toast inside the viewport with its close button reachable', async () => {
    await setup(
      <ToastProvider>
        <ToastLauncher />
      </ToastProvider>
    )
    await userEvent.click(page.getByRole('button', { name: 'avisar' }))
    await expect.poll(() => document.querySelector('[data-slot="toast-close"]')).toBeTruthy()

    insideViewport(document.querySelector('[data-slot="toast-close"]'), 'toast close')
    insideViewport(document.querySelector('[data-slot="toast"]'), 'toast')
    expect(audit(`toast@${width}`).join(' | ')).toBe('')
  })

  it('keeps a long tooltip bubble inside the viewport', async () => {
    await setup(
      <div style={{ padding: 40 }}>
        <Tooltip text={`${worstCase.longTitle} ${worstCase.longEmail} ${worstCase.longUrl}`} position="bottom">
          <button>Alvo</button>
        </Tooltip>
      </div>
    )
    await userEvent.hover(page.getByRole('button', { name: 'Alvo' }))
    await expect.poll(() => document.querySelector('[data-slot="tooltip-bubble"]')).toBeTruthy()

    insideViewport(document.querySelector('[data-slot="tooltip-bubble"]'), 'tooltip bubble')
  })

  it('keeps a popover with long content inside the viewport', async () => {
    await setup(
      <div style={{ padding: 40 }}>
        <Popover content={<p>{`${worstCase.longEmail} ${worstCase.longUrl}`}</p>} defaultOpen>
          <button>Gatilho</button>
        </Popover>
      </div>
    )
    await expect.poll(() => document.querySelector('[data-slot="popover-content"]')).toBeTruthy()

    insideViewport(document.querySelector('[data-slot="popover-content"]'), 'popover content')
  })

  it('keeps the sidebar user readable with a long name and a reachable logout', async () => {
    await setup(
      <div style={{ inlineSize: 280 }}>
        {[worstCase.longName, worstCase.emojiName, worstCase.zwjName, worstCase.arabicName, worstCase.shortName, worstCase.spacedName].map((name) => (
          <SidebarUser key={name} name={name} collapsed={false} onLogout={() => undefined} />
        ))}
      </div>
    )

    for (const logout of document.querySelectorAll('[data-slot="sidebar-user-logout"]')) insideViewport(logout, 'logout')
    for (const avatar of document.querySelectorAll('[data-slot="sidebar-user-avatar"]')) expect(lonelySurrogate.test(avatar.textContent ?? ''), `avatar initial ${avatar.textContent}`).toBe(false)
    expect(audit(`sidebar-user@${width}`).join(' | ')).toBe('')
  })

  it('keeps a long footer inside the page', async () => {
    await setup(<Footer companyName={worstCase.longTitle} notice={worstCase.longUrl} links={[{ label: worstCase.germanCompound, href: '/a' }, { label: worstCase.frenchLabel, href: '/b' }]} />)

    expect(audit(`footer@${width}`).join(' | ')).toBe('')
  })
})
