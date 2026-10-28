import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { Accordion } from '@components/common/Accordion/index.tsx'
import { Alert } from '@components/common/Alert/index.tsx'
import { Badge } from '@components/common/Badge/index.tsx'
import { Card } from '@components/common/Card/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { Table } from '@components/common/Table/index.tsx'
import { Tabs } from '@components/common/Tabs/index.tsx'
import { useToast } from '@components/toast/index.ts'
import { renderInBrowser } from './harness.tsx'
import { pressMouse, releaseMouse } from './pointer.ts'
import { waitForSettled } from './settle.ts'

import type { CSSProperties, ReactNode } from 'react'

const scoped = (style: Record<string, string>, children: ReactNode) => <div style={style as CSSProperties}>{children}</div>

const parts = (name: string) => [...document.body.querySelectorAll<HTMLElement>(`[data-slot="${name}"]`)]

const part = (name: string, index = 0) => parts(name)[index]

const style = (name: string, index = 0) => getComputedStyle(part(name, index))

const onRoot = (variables: Record<string, string>) => {
  for (const [name, value] of Object.entries(variables)) document.documentElement.style.setProperty(name, value)
}

afterEach(async () => {
  await releaseMouse()
  document.documentElement.removeAttribute('style')
})

const colorOf = (value: string) => value.replace(/\s+/g, '')

const paddings = (name: string, index = 0) => {
  const computed = style(name, index)

  return [computed.paddingTop, computed.paddingRight, computed.paddingBottom, computed.paddingLeft]
}

const items = [
  { value: 'one', label: 'One', content: <p>First</p> },
  { value: 'two', label: 'Two', content: <p>Second</p> }
]

const columns = [{ key: 'name', header: 'Name' }]

const rows = [{ name: 'Ana' }, { name: 'Bia' }]

const variants = ['info', 'success', 'warning', 'error'] as const

const swatch = (index: number) => `rgb(${index * 10 + 1}, ${index * 10 + 2}, ${index * 10 + 3})`

describe('the alert from the hooks', () => {
  it('takes the colors of each variant from their own hooks', () => {
    renderInBrowser(
      scoped(
        Object.fromEntries(variants.flatMap((variant, index) => [[`--enchase-alert-background-${variant}`, swatch(index * 2)], [`--enchase-alert-color-${variant}`, swatch(index * 2 + 1)]])),
        <>
          {variants.map((variant) => (
            <Alert key={variant} variant={variant}>
              {variant}
            </Alert>
          ))}
        </>
      )
    )

    expect(parts('alert').map((alert) => [getComputedStyle(alert).backgroundColor, getComputedStyle(alert).color])).toEqual(variants.map((_, index) => [swatch(index * 2), swatch(index * 2 + 1)]))
  })

  it('keeps the colors of the other variants when only one is changed', () => {
    renderInBrowser(
      scoped(
        { '--enchase-alert-background-info': 'rgb(1, 2, 3)' },
        <>
          <Alert variant="info">Info</Alert>
          <Alert variant="error">Failed</Alert>
        </>
      )
    )

    expect(style('alert', 0).backgroundColor).toBe('rgb(1, 2, 3)')
    expect(style('alert', 1).backgroundColor).not.toBe('rgb(1, 2, 3)')
  })

  it('takes the padding, the gap and the height of the icon row from its hooks', () => {
    renderInBrowser(scoped({ '--enchase-alert-padding-block': '9px', '--enchase-alert-padding-inline': '11px', '--enchase-alert-gap': '13px', '--enchase-alert-row-height': '40px' }, <Alert title="Heads up">Saved</Alert>))

    expect(paddings('alert')).toEqual(['9px', '11px', '9px', '11px'])
    expect(style('alert').columnGap).toBe('13px')
    expect(style('alert-icon').height).toBe('40px')
  })

  it('follows the space of the theme when no hook is set', () => {
    renderInBrowser(scoped({ '--enchase-space-md': '1.25rem' }, <Alert>Saved</Alert>))

    expect(style('alert').paddingLeft).toBe('20px')
  })
})

const badgeVariants = ['neutral', 'primary', 'success', 'warning', 'error', 'info'] as const

describe('the badge from the hooks', () => {
  it('takes the colors of each variant from their own hooks', () => {
    renderInBrowser(
      scoped(
        Object.fromEntries(badgeVariants.flatMap((variant, index) => [[`--enchase-badge-background-${variant}`, swatch(index * 2)], [`--enchase-badge-color-${variant}`, swatch(index * 2 + 1)]])),
        <>
          {badgeVariants.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </>
      )
    )

    expect(parts('badge').map((badge) => [getComputedStyle(badge).backgroundColor, getComputedStyle(badge).color])).toEqual(badgeVariants.map((_, index) => [swatch(index * 2), swatch(index * 2 + 1)]))
  })

  it('takes the colors of a variant and the size of each size from their hooks', () => {
    renderInBrowser(
      scoped(
        { '--enchase-badge-background-success': 'rgb(1, 2, 3)', '--enchase-badge-color-success': 'rgb(4, 5, 6)', '--enchase-badge-min-height-sm': '31px', '--enchase-badge-padding-inline-md': '17px', '--enchase-badge-gap': '5px' },
        <>
          <Badge variant="success" size="sm">
            Small
          </Badge>
          <Badge variant="primary" size="md">
            Medium
          </Badge>
        </>
      )
    )

    expect([style('badge', 0).backgroundColor, style('badge', 0).color, style('badge', 0).minHeight]).toEqual(['rgb(1, 2, 3)', 'rgb(4, 5, 6)', '31px'])
    expect([style('badge', 1).paddingLeft, style('badge', 1).minHeight, style('badge', 1).columnGap]).toEqual(['17px', '24px', '5px'])
  })
})

describe('the card from the hooks', () => {
  it('takes the padding, the colors, the shadow and the border of each variant from their hooks', () => {
    renderInBrowser(
      scoped(
        {
          '--enchase-card-padding': '9px',
          '--enchase-card-background-default': 'rgb(1, 2, 3)',
          '--enchase-card-background-elevated': 'rgb(4, 5, 6)',
          '--enchase-card-shadow-elevated': '0 0 0 3px rgb(7, 8, 9)',
          '--enchase-card-background-outlined': 'rgb(10, 11, 12)',
          '--enchase-card-border-color-outlined': 'rgb(13, 14, 15)'
        },
        <>
          <Card variant="default">One</Card>
          <Card variant="elevated">Two</Card>
          <Card variant="outlined">Three</Card>
        </>
      )
    )

    expect(parts('card').map((card) => getComputedStyle(card).backgroundColor)).toEqual(['rgb(1, 2, 3)', 'rgb(4, 5, 6)', 'rgb(10, 11, 12)'])
    expect(style('card', 1).boxShadow).toContain('rgb(7, 8, 9)')
    expect(style('card', 2).borderTopColor).toBe('rgb(13, 14, 15)')
    expect(paddings('card')).toEqual(['9px', '9px', '9px', '9px'])
  })

  it('takes the shadow of a hovered elevated card from its own hook', async () => {
    renderInBrowser(scoped({ '--enchase-card-shadow-elevated-hover': '0 0 0 4px rgb(1, 2, 3)' }, <Card variant="elevated">Two</Card>))
    await userEvent.hover(part('card'))
    await waitForSettled(() => part('card'))

    expect(colorOf(style('card').boxShadow)).toContain('rgb(1,2,3)')
  })
})

describe('the table from the hooks', () => {
  it('takes the border, the header and the cell padding of each size from their hooks', () => {
    renderInBrowser(
      scoped(
        {
          '--enchase-table-border-color': 'rgb(1, 2, 3)',
          '--enchase-table-header-background': 'rgb(4, 5, 6)',
          '--enchase-table-header-color': 'rgb(7, 8, 9)',
          '--enchase-table-cell-padding-block': '9px',
          '--enchase-table-cell-padding-inline': '11px',
          '--enchase-table-cell-border-color': 'rgb(10, 11, 12)',
          '--enchase-table-caption-padding': '13px'
        },
        <Table caption="Orders" columns={columns} rows={rows} />
      )
    )

    expect(style('table').borderTopColor).toBe('rgb(1, 2, 3)')
    expect([style('table-header').backgroundColor, style('table-header').color]).toEqual(['rgb(4, 5, 6)', 'rgb(7, 8, 9)'])
    expect(paddings('table-header')).toEqual(['9px', '11px', '9px', '11px'])
    expect(paddings('table-cell')).toEqual(['9px', '11px', '9px', '11px'])
    expect(style('table-header').borderBottomColor).toBe('rgb(10, 11, 12)')
    expect(style('table-caption').paddingTop).toBe('13px')
  })

  it('takes the padding of the small size and the stripe from their hooks', () => {
    renderInBrowser(
      scoped({ '--enchase-table-cell-padding-block-sm': '3px', '--enchase-table-cell-padding-inline-sm': '5px', '--enchase-table-row-background-striped': 'rgb(1, 2, 3)' }, <Table size="sm" striped columns={columns} rows={rows} />)
    )

    expect(paddings('table-cell')).toEqual(['3px', '5px', '3px', '5px'])
    expect(getComputedStyle(parts('table-row')[1]).backgroundColor).toBe('rgb(1, 2, 3)')
  })

  it('shares the cell hooks between the header, the cells and the header of a row', () => {
    renderInBrowser(
      scoped(
        { '--enchase-table-cell-padding-inline': '7px' },
        <Table columns={[{ key: 'name', header: 'Name', rowHeader: true }]} rows={rows} />
      )
    )

    expect([style('table-header').paddingLeft, style('table-row-header').paddingLeft]).toEqual(['7px', '7px'])
  })

  it('takes the padding and the color of the empty message from their hooks', () => {
    renderInBrowser(scoped({ '--enchase-table-empty-padding': '9px', '--enchase-table-empty-color': 'rgb(1, 2, 3)' }, <Table columns={columns} rows={[]} empty="Nothing" />))

    expect([style('table-empty').paddingTop, style('table-empty').color]).toEqual(['9px', 'rgb(1, 2, 3)'])
  })

  it('takes the gap of the sort button and the size and the strength of its indicator from their hooks', () => {
    renderInBrowser(
      scoped(
        { '--enchase-table-sort-gap': '13px', '--enchase-table-sort-icon-width': '21px', '--enchase-table-sort-icon-height': '19px', '--enchase-table-sort-icon-opacity': '0.7' },
        <Table columns={[{ key: 'name', header: 'Name', sortable: true }]} rows={rows} />
      )
    )

    expect(style('table-sort').columnGap).toBe('13px')
    expect([style('table-sort-icon').width, style('table-sort-icon').height]).toEqual(['21px', '19px'])
    expect(getComputedStyle(part('table-sort-icon').querySelector('path') as SVGPathElement).opacity).toBe('0.7')
  })
})

describe('the accordion from the hooks', () => {
  it('takes the borders, the trigger and the panel from their hooks', async () => {
    renderInBrowser(
      scoped(
        {
          '--enchase-accordion-border-color': 'rgb(1, 2, 3)',
          '--enchase-accordion-item-border-color': 'rgb(4, 5, 6)',
          '--enchase-accordion-trigger-min-height': '61px',
          '--enchase-accordion-trigger-padding-block': '9px',
          '--enchase-accordion-trigger-padding-inline': '11px',
          '--enchase-accordion-trigger-gap': '13px',
          '--enchase-accordion-trigger-color': 'rgb(7, 8, 9)',
          '--enchase-accordion-icon-color': 'rgb(10, 11, 12)',
          '--enchase-accordion-panel-padding-inline': '15px'
        },
        <Accordion items={[{ value: 'a', title: 'A', content: 'First' }, { value: 'b', title: 'B', content: 'Second' }]} defaultValue={['a']} />
      )
    )

    expect(style('accordion').borderTopColor).toBe('rgb(1, 2, 3)')
    expect(style('accordion-item', 1).borderTopColor).toBe('rgb(4, 5, 6)')
    expect(style('accordion-trigger').minHeight).toBe('61px')
    expect([style('accordion-trigger').paddingTop, style('accordion-trigger').paddingLeft, style('accordion-trigger').columnGap]).toEqual(['9px', '11px', '13px'])
    expect([style('accordion-trigger').color, style('accordion-icon').color]).toEqual(['rgb(7, 8, 9)', 'rgb(10, 11, 12)'])
    expect(style('accordion-panel').paddingLeft).toBe('15px')
  })
})

describe('the modal from the hooks', () => {
  it('takes the overlay, the panel, the paddings and the colors from their hooks', () => {
    onRoot({
      '--enchase-modal-overlay-background': 'rgb(1, 2, 3)',
      '--enchase-modal-panel-background': 'rgb(4, 5, 6)',
      '--enchase-modal-panel-shadow': '0 0 0 3px rgb(7, 8, 9)',
      '--enchase-modal-header-padding-inline': '9px',
      '--enchase-modal-body-padding-inline': '11px',
      '--enchase-modal-footer-padding-inline': '13px',
      '--enchase-modal-title-color': 'rgb(10, 11, 12)',
      '--enchase-modal-body-color': 'rgb(13, 14, 15)',
      '--enchase-modal-close-color': 'rgb(16, 17, 18)'
    })
    renderInBrowser(
      <Modal isOpen onClose={() => undefined} title="Title" footer={<span>Footer</span>}>
        Body
      </Modal>
    )

    expect(style('modal-overlay').backgroundColor).toBe('rgb(1, 2, 3)')
    expect([style('modal-panel').backgroundColor, colorOf(style('modal-panel').boxShadow)]).toEqual(['rgb(4, 5, 6)', expect.stringContaining('rgb(7,8,9)')])
    expect([style('modal-header').paddingLeft, style('modal-body').paddingLeft, style('modal-footer').paddingLeft]).toEqual(['9px', '11px', '13px'])
    expect([style('modal-title').color, style('modal-body').color, style('modal-close').color]).toEqual(['rgb(10, 11, 12)', 'rgb(13, 14, 15)', 'rgb(16, 17, 18)'])
  })

  it('takes the vertical padding of the footer from its hook', () => {
    onRoot({ '--enchase-modal-footer-padding-block': '17px' })
    renderInBrowser(
      <Modal isOpen onClose={() => undefined} title="Title" footer={<span>Footer</span>}>
        Body
      </Modal>
    )

    expect([style('modal-footer').paddingTop, style('modal-footer').paddingBottom]).toEqual(['17px', '17px'])
  })

  it('takes the color of the close button while hovered and while pressed from their hooks', async () => {
    onRoot({ '--enchase-modal-close-color-hover': 'rgb(1, 2, 3)', '--enchase-modal-close-color-active': 'rgb(4, 5, 6)' })
    renderInBrowser(
      <Modal isOpen onClose={() => undefined} title="Title">
        Body
      </Modal>
    )
    await userEvent.hover(part('modal-close'))
    await waitForSettled(() => part('modal-close'))

    expect(style('modal-close').color).toBe('rgb(1, 2, 3)')

    await pressMouse('[data-slot="modal-close"]')
    await waitForSettled(() => part('modal-close'))

    expect(style('modal-close').color).toBe('rgb(4, 5, 6)')
  })

  it('takes the widest size of each modal size from its own hook', () => {
    onRoot({ '--enchase-modal-panel-max-width-sm': '311px', '--enchase-modal-panel-max-width-lg': '713px', '--enchase-modal-panel-max-width-xl': '911px' })
    renderInBrowser(
      <>
        {(['sm', 'lg', 'xl'] as const).map((size) => (
          <Modal key={size} isOpen onClose={() => undefined} title={size} size={size}>
            Body
          </Modal>
        ))}
      </>
    )

    expect(parts('modal-panel').map((panel) => getComputedStyle(panel).maxWidth)).toEqual(['311px', '713px', '911px'])
  })
})

describe('the tabs from the hooks', () => {
  it('takes the colors, the padding and the height of a tab from their hooks', () => {
    renderInBrowser(
      scoped(
        {
          '--enchase-tabs-list-border-color': 'rgb(1, 2, 3)',
          '--enchase-tabs-tab-color': 'rgb(4, 5, 6)',
          '--enchase-tabs-tab-color-selected': 'rgb(7, 8, 9)',
          '--enchase-tabs-tab-min-height': '51px',
          '--enchase-tabs-tab-padding-block': '9px',
          '--enchase-tabs-tab-padding-inline': '11px',
          '--enchase-tabs-panel-padding-block-start': '13px'
        },
        <Tabs ariaLabel="Account" items={items} defaultValue="one" />
      )
    )

    expect(colorOf(style('tabs-list').boxShadow)).toContain('rgb(1,2,3)')
    expect([style('tabs-tab', 0).color, style('tabs-tab', 1).color]).toEqual(['rgb(7, 8, 9)', 'rgb(4, 5, 6)'])
    expect([style('tabs-tab', 1).minHeight, style('tabs-tab', 1).paddingTop, style('tabs-tab', 1).paddingLeft]).toEqual(['51px', '9px', '11px'])
    expect(style('tabs-panel').paddingTop).toBe('13px')
  })

  it('takes the color of an unselected tab under the pointer from its hook', async () => {
    renderInBrowser(scoped({ '--enchase-tabs-tab-color-hover': 'rgb(1, 2, 3)' }, <Tabs ariaLabel="Account" items={items} defaultValue="one" />))
    await userEvent.hover(part('tabs-tab', 1))
    await waitForSettled(() => part('tabs-tab', 1))

    expect(style('tabs-tab', 1).color).toBe('rgb(1, 2, 3)')
    expect(style('tabs-tab', 0).color).not.toBe('rgb(1, 2, 3)')
  })

  it('draws the underline of the selected tab and the sliding indicator with one color hook', () => {
    renderInBrowser(scoped({ '--enchase-tabs-indicator-color': 'rgb(1, 2, 3)' }, <Tabs ariaLabel="Account" items={items} defaultValue="one" />))

    const underline = getComputedStyle(part('tabs-tab', 0), '::before').borderBottomColor
    const indicator = style('tabs-indicator').borderBottomColor

    expect([underline, indicator]).toEqual(['rgb(1, 2, 3)', 'rgb(1, 2, 3)'])
  })
})

const Notifier = () => {
  const toast = useToast()

  return (
    <>
      <button type="button" onClick={() => toast.success('Saved', 0)}>
        Notify
      </button>
      <button type="button" onClick={() => toast.error('Failed', 0)}>
        Fail
      </button>
      <button type="button" onClick={() => toast.warning('Careful', 0)}>
        Warn
      </button>
      <button type="button" onClick={() => toast.info('Heads up', 0)}>
        Inform
      </button>
      <button type="button" onClick={() => toast.info('Timed', 60000)}>
        Timed
      </button>
    </>
  )
}

describe('the toast from the hooks', () => {
  it('takes the colors of each type from their own hooks', async () => {
    const types = ['success', 'error', 'warning', 'info'] as const

    onRoot(Object.fromEntries(types.flatMap((type, index) => [[`--enchase-toast-background-${type}`, swatch(index * 2)], [`--enchase-toast-color-${type}`, swatch(index * 2 + 1)]])))
    renderInBrowser(<Notifier />)

    for (const name of ['Notify', 'Fail', 'Warn', 'Inform']) await userEvent.click(page.getByRole('button', { name }))

    await expect.poll(() => parts('toast').length).toBe(4)

    const byText = (content: string) => getComputedStyle(parts('toast').find((toast) => toast.textContent?.includes(content)) as HTMLElement)

    expect(['Saved', 'Failed', 'Careful', 'Heads up'].map((content) => [byText(content).backgroundColor, byText(content).color])).toEqual(types.map((_, index) => [swatch(index * 2), swatch(index * 2 + 1)]))
  })

  it('takes the box of a toast from its hooks', async () => {
    onRoot({
      '--enchase-toast-padding-block': '9px',
      '--enchase-toast-min-height': '71px',
      '--enchase-toast-margin-block-end': '13px',
      '--enchase-toast-shadow': '0 0 0 3px rgb(10, 11, 12)'
    })
    renderInBrowser(<Notifier />)
    await userEvent.click(page.getByRole('button', { name: 'Notify' }))
    await expect.poll(() => parts('toast').length).toBe(1)

    expect([style('toast').paddingTop, style('toast').minHeight, style('toast').marginBottom]).toEqual(['9px', '71px', '13px'])
    expect(colorOf(style('toast').boxShadow)).toContain('rgb(10,11,12)')
  })

  it('takes the inline padding, the height cap, the body and the icon from their hooks', async () => {
    onRoot({
      '--enchase-toast-padding-inline': '7px 17px',
      '--enchase-toast-max-height': '97px',
      '--enchase-toast-body-padding-block': '5px',
      '--enchase-toast-icon-width': '27px',
      '--enchase-toast-icon-margin-inline-end': '19px'
    })
    renderInBrowser(<Notifier />)
    await userEvent.click(page.getByRole('button', { name: 'Notify' }))
    await expect.poll(() => parts('toast').length).toBe(1)

    const body = part('toast').firstElementChild as HTMLElement
    const icon = body.firstElementChild as HTMLElement

    expect([style('toast').paddingLeft, style('toast').paddingRight, style('toast').maxHeight]).toEqual(['7px', '17px', '97px'])
    expect([getComputedStyle(body).paddingTop, getComputedStyle(body).paddingBottom]).toEqual(['5px', '5px'])
    expect([getComputedStyle(icon).width, getComputedStyle(icon).marginRight]).toEqual(['27px', '19px'])
  })

  it('keeps the 0.4 opacity of the progress bar until its hook says otherwise', async () => {
    renderInBrowser(<Notifier />)
    await userEvent.click(page.getByRole('button', { name: 'Timed' }))
    await expect.poll(() => parts('toast-progress').length).toBe(1)

    expect(style('toast-progress').opacity).toBe('0.4')
  })

  it('takes the opacity and the height of the progress bar from their hooks', async () => {
    onRoot({ '--enchase-toast-progress-opacity': '0.8', '--enchase-toast-progress-height': '5px' })
    renderInBrowser(<Notifier />)
    await userEvent.click(page.getByRole('button', { name: 'Timed' }))
    await expect.poll(() => parts('toast-progress').length).toBe(1)

    expect([style('toast-progress').opacity, style('toast-progress').height]).toEqual(['0.8', '5px'])
  })
})
