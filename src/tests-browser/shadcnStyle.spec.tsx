import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Accordion } from '@components/common/Accordion/index.tsx'
import { Alert } from '@components/common/Alert/index.tsx'
import { Badge } from '@components/common/Badge/index.tsx'
import Breadcrumbs from '@components/common/Breadcrumbs/index.tsx'
import { Button } from '@components/common/Button/index.tsx'
import { Card } from '@components/common/Card/index.tsx'
import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { CheckboxGroup } from '@components/common/CheckboxGroup/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Drawer } from '@components/common/Drawer/index.tsx'
import { Menu } from '@components/common/Menu/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { NumberInput } from '@components/common/NumberInput/index.tsx'
import { Pagination } from '@components/common/Pagination/index.tsx'
import Popover from '@components/common/Popover/index.tsx'
import { RadioGroup } from '@components/common/RadioGroup/index.tsx'
import { SegmentedControl } from '@components/common/SegmentedControl/index.tsx'
import { Select } from '@components/common/Select/index.tsx'
import { Switch } from '@components/common/Switch/index.tsx'
import { Table } from '@components/common/Table/index.tsx'
import { Tabs } from '@components/common/Tabs/index.tsx'
import { Textarea } from '@components/common/Textarea/index.tsx'
import Tooltip from '@components/common/Tooltip/index.tsx'
import { useToast } from '@components/toast/index.ts'
import { shadcn } from '@styles/presets/shadcn.ts'
import { parseComputedColor } from './color.ts'
import { unlessWebkit } from './browserSkips.ts'
import { renderInBrowser } from './harness.tsx'
import { at, becomes, onRoot, part, parts, style } from './hookProbes.ts'
import { setForcedColors } from './media.ts'

import type { ThemeInput } from '@styles/theme/createTheme.ts'
import type { Rgba } from './color.ts'
import type { ReactElement } from 'react'

const styled = { style: shadcn } as const

const show = (ui: ReactElement, mode: 'light' | 'dark' = 'light', theme: ThemeInput = styled) => renderInBrowser(ui, 'never', mode, theme)

const px = (value: string) => parseFloat(value)

const colorOf = (value: string): Rgba => parseComputedColor(value)

const roleColor = (role: string) => {
  const probe = document.createElement('span')

  probe.style.color = `var(--enchase-color-${role})`
  document.body.append(probe)

  const color = getComputedStyle(probe).color

  probe.remove()

  return color
}

const options = [
  { value: 'br', label: 'Brasil' },
  { value: 'pt', label: 'Portugal' }
]

afterEach(async () => {
  await setForcedColors('none')
  document.documentElement.removeAttribute('style')
})

describe('the buttons of the shadcn style', () => {
  it.each([
    ['sm', 32, 12],
    ['md', 36, 16],
    ['lg', 40, 24]
  ] as const)('sizes the %s button at %ipx with %ipx of padding, 8px corners and 14px medium type', (size, height, padding) => {
    show(<Button size={size}>Save</Button>)
    const button = style('button')

    expect(px(button.height)).toBe(height)
    expect(px(button.paddingLeft)).toBe(padding)
    expect(px(button.borderTopLeftRadius)).toBe(8)
    expect(px(button.fontSize)).toBe(14)
    expect(button.fontWeight).toBe('500')
  })

  it('paints the primary button with the neutral palette and the small shadow, and the outline button with the border and the same shadow', () => {
    show(
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </>
    )

    expect(style('button', 0).backgroundColor).toBe('rgb(23, 23, 23)')
    expect(style('button', 0).color).toBe('rgb(250, 250, 250)')
    expect(style('button', 0).boxShadow).toBe('rgba(0, 0, 0, 0.05) 0px 1px 2px 0px')
    expect(style('button', 1).backgroundColor).toBe('rgb(245, 245, 245)')
    expect(style('button', 2).borderTopColor).toBe('rgb(229, 229, 229)')
    expect(style('button', 2).borderTopWidth).toBe('1px')
    expect(style('button', 2).boxShadow).toBe('rgba(0, 0, 0, 0.05) 0px 1px 2px 0px')
    expect(style('button', 3).boxShadow).toBe('none')
    expect(style('button', 3).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  })

  it('keeps the disabled buttons in their own colors at half opacity', () => {
    show(
      <>
        <Button variant="primary" disabled>
          Primary
        </Button>
        <Button variant="outline" disabled>
          Outline
        </Button>
      </>
    )

    for (const index of [0, 1]) expect(style('button', index).opacity).toBe('0.5')

    expect(style('button', 0).backgroundColor).toBe('rgb(23, 23, 23)')
    expect(style('button', 0).color).toBe('rgb(250, 250, 250)')
    expect(style('button', 1).color).toBe('rgb(10, 10, 10)')
  })

  it('keeps the 2px focus ring in the primary color, 2px away from the button', async () => {
    show(<Button>Save</Button>)
    await userEvent.tab()
    const button = style('button')

    expect(button.outlineStyle).toBe('solid')
    expect(button.outlineWidth).toBe('2px')
    expect(button.outlineOffset).toBe('2px')
    expect(button.outlineColor).toBe('rgb(23, 23, 23)')
  })

  it('paints the buttons in the light colors of the dark mode', async () => {
    show(<Button>Save</Button>, 'dark')

    await becomes(at('button'), 'background-color', 'rgb(229, 229, 229)')
    await becomes(at('button'), 'color', 'rgb(23, 23, 23)')
  })
})

describe('the fields of the shadcn style', () => {
  it('puts the label above the control, 14px medium, 8px from the field', () => {
    show(<Input label="Email" />)
    const label = part('input-label')
    const control = part('input-control')

    expect(part('input').dataset.labelPlacement).toBe('stacked')
    expect(label.compareDocumentPosition(control) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(px(getComputedStyle(label).fontSize)).toBe(14)
    expect(getComputedStyle(label).fontWeight).toBe('500')
    expect(getComputedStyle(label).position).toBe('static')
    expect(Math.round(control.getBoundingClientRect().top - label.getBoundingClientRect().bottom)).toBe(8)
  })

  it.each([
    { name: 'input', ui: <Input label="Name" />, field: 'input-field' },
    { name: 'number input', ui: <NumberInput label="Amount" />, field: 'number-input-field' },
    { name: 'select', ui: <Select label="Country" options={options} />, field: 'select-field' },
    { name: 'textarea', ui: <Textarea label="Notes" />, field: 'textarea-field' }
  ])('gives the $name the 14px type, the 12px padding and the 8px corner of the style, with a strong border and the small shadow', ({ ui, field }) => {
    show(ui)
    const control = style(field)
    const outline = style(field.replace('field', 'outline'))

    expect(px(control.fontSize)).toBe(14)
    expect(px(control.paddingLeft)).toBe(12)
    expect(px(outline.borderTopLeftRadius)).toBe(8)
    expect(outline.borderTopWidth).toBe('1px')
    expect(outline.borderTopColor).toBe('rgb(128, 128, 128)')
    expect(outline.boxShadow).toBe('rgba(0, 0, 0, 0.05) 0px 1px 2px 0px')

    if (field !== 'textarea-field') expect(px(control.height)).toBe(36)
  })

  it('draws the focus as a primary border and a 3px ring, and keeps the width of the border', async () => {
    show(<Input label="Email" />)
    part('input-field').focus()

    await becomes(at('input-outline'), 'border-top-color', 'rgb(23, 23, 23)')
    expect(style('input-outline').borderTopWidth).toBe('1px')
    expect(style('input-outline').boxShadow).toMatch(/0px 0px 0px 3px/)
  })

  it('draws the focus of a field with an error in the error color', async () => {
    show(<Input label="Email" error="Wrong" />)
    part('input-field').focus()

    await becomes(at('input-outline'), 'border-top-color', 'rgb(210, 0, 0)')
    expect(style('input-label').color).toBe('rgb(210, 0, 0)')
  })

  it.runIf(unlessWebkit('forcedColors'))('thickens the focus border to 2px in forced colors, where the ring made with a shadow is gone', async () => {
    await setForcedColors('active')
    show(<Input label="Email" />)
    part('input-field').focus()

    await becomes(at('input-outline'), 'border-top-width', '2px')
    expect(style('input-outline').boxShadow).toBe('none')
  })

  it('halves the opacity of a disabled field and keeps its label in the text color', () => {
    show(<Input label="Email" disabled />)

    expect(style('input-field').opacity).toBe('0.5')
    expect(style('input-outline').opacity).toBe('0.5')
    expect(style('input-label').opacity).toBe('0.5')
    expect(style('input-label').color).toBe('rgb(10, 10, 10)')
  })

  it('keeps the buttons inside the field with the smaller hit size', () => {
    show(
      <>
        <Input label="Password" type="password" />
        <NumberInput label="Amount" />
      </>
    )
    const outline = part('input-outline').getBoundingClientRect()
    const toggle = part('input-toggle').getBoundingClientRect()
    const field = part('number-input-outline').getBoundingClientRect()
    const stepper = part('number-input-increase').getBoundingClientRect()

    expect(toggle.height).toBe(32)
    expect(toggle.top).toBeGreaterThan(outline.top)
    expect(toggle.bottom).toBeLessThan(outline.bottom)
    expect(stepper.height).toBe(32)
    expect(stepper.top).toBeGreaterThan(field.top)
    expect(stepper.bottom).toBeLessThan(field.bottom)
  })

  it('lets the label placement of the prop win over the style, in both directions', () => {
    show(
      <>
        <Input label="Floating" labelPlacement="floating" />
        <Input label="Stacked" />
      </>
    )

    expect(parts('input')[0].dataset.labelPlacement).toBeUndefined()
    expect(getComputedStyle(part('input-label', 0)).position).toBe('absolute')
    expect(parts('input')[1].dataset.labelPlacement).toBe('stacked')
    expect(getComputedStyle(part('input-label', 1)).position).toBe('static')
  })

  it('keeps the label floating when no style is given, and stacks it on request', () => {
    show(
      <>
        <Input label="Default" />
        <Input label="Requested" labelPlacement="stacked" />
      </>,
      'light',
      {}
    )

    expect(getComputedStyle(part('input-label', 0)).position).toBe('absolute')
    expect(getComputedStyle(part('input-label', 1)).position).toBe('static')
  })
})

describe('the selection controls of the shadcn style', () => {
  it('draws the checkbox with a 16px box, 4px corners and a 1px border', () => {
    show(<Checkbox label="Accept" />)
    const box = style('checkbox-box')

    expect(px(box.width)).toBe(16)
    expect(px(box.height)).toBe(16)
    expect(px(box.borderTopLeftRadius)).toBe(4)
    expect(box.borderTopWidth).toBe('1px')
    expect(box.borderTopColor).toBe('rgb(128, 128, 128)')
    expect(px(style('checkbox-label').fontSize)).toBe(14)
  })

  it('fills the checked checkbox with the primary color', () => {
    show(<Checkbox label="Accept" defaultChecked />)

    expect(style('checkbox-box').backgroundColor).toBe('rgb(23, 23, 23)')
    expect(style('checkbox-box').borderTopColor).toBe('rgb(23, 23, 23)')
  })

  it('draws the radio with a 16px control and the switch with a 32px by 18.4px track and a 16px thumb', () => {
    show(
      <>
        <RadioGroup label="Plan" options={[{ value: 'a', label: 'A' }]} />
        <Switch label="Alerts" />
      </>
    )

    expect(px(style('radio-group-control').width)).toBe(16)
    expect(px(style('radio-group-control').height)).toBe(16)
    expect(px(style('switch-track').width)).toBe(32)
    expect(px(style('switch-track').height)).toBeCloseTo(18.4, 1)
    expect(px(style('switch-thumb').width)).toBe(16)
  })

  it('paints the switch with the strong border color when off and the primary color when on, with the page color on the thumb', () => {
    show(
      <>
        <Switch label="Off" />
        <Switch label="On" defaultChecked />
      </>
    )

    expect(style('switch-track', 0).backgroundColor).toBe('rgb(128, 128, 128)')
    expect(style('switch-track', 1).backgroundColor).toBe('rgb(23, 23, 23)')
    expect(style('switch-thumb', 0).backgroundColor).toBe('rgb(255, 255, 255)')
  })

  it('shows the legend of the group in the text color and the error in regular weight', () => {
    show(<RadioGroup label="Plan" options={[{ value: 'a', label: 'A' }]} error="Pick one" />)

    expect(style('radio-group-legend').fontWeight).toBe('500')
    expect(px(style('radio-group-legend').fontSize)).toBe(14)
    expect(style('radio-group-error').fontWeight).toBe('400')
  })

  it('shows the legend of the checkbox group in medium weight and the error in regular weight', () => {
    show(<CheckboxGroup label="Topics" options={[{ value: 'a', label: 'A' }]} error="Pick one" />)

    expect(style('checkbox-group-legend').fontWeight).toBe('500')
    expect(px(style('checkbox-group-legend').fontSize)).toBe(14)
    expect(style('checkbox-group-error').fontWeight).toBe('400')
    expect(px(style('checkbox-group-error').fontSize)).toBe(14)
  })

  it('shows the legend of the checkbox group in the text color when there is no error', () => {
    show(<CheckboxGroup label="Topics" options={[{ value: 'a', label: 'A' }]} />)

    expect(style('checkbox-group-legend').color).toBe(roleColor('text-primary'))
  })

  it('draws the segmented control with a light border, 8px corners, a gray fill on the checked option and 36px of height', () => {
    show(<SegmentedControl ariaLabel="View" items={[{ value: 'a', label: 'List' }, { value: 'b', label: 'Board' }]} defaultValue="a" />)

    expect(style('segmented-control').borderTopColor).toBe('rgb(229, 229, 229)')
    expect(px(style('segmented-control').borderTopLeftRadius)).toBe(8)
    expect(px(style('segmented-control').height)).toBe(36)
    expect(style('segmented-control-item', 0).backgroundColor).toBe('rgb(245, 245, 245)')
    expect(style('segmented-control-item', 0).color).toBe('rgb(10, 10, 10)')
    expect(style('segmented-control-item', 1).borderInlineStartColor).toBe('rgb(229, 229, 229)')
    expect([px(style('segmented-control-item', 0).paddingLeft), px(style('segmented-control-item', 0).fontSize)]).toEqual([12, 14])
  })

  it('keeps the 2px ring 2px from the box of the checkbox', async () => {
    show(<Checkbox label="Accept" />)
    await userEvent.tab()
    const input = style('checkbox-input')

    expect(input.outlineWidth).toBe('2px')
    expect(input.outlineOffset).toBe('2px')
  })
})

describe('the containers of the shadcn style', () => {
  it('draws the alerts with a border, the page color and a colored icon and title', () => {
    show(
      <>
        <Alert variant="info" title="Info">
          Message
        </Alert>
        <Alert variant="error" title="Error">
          Message
        </Alert>
      </>
    )

    for (const index of [0, 1]) {
      expect(style('alert', index).borderTopWidth).toBe('1px')
      expect(style('alert', index).borderTopColor).toBe('rgb(229, 229, 229)')
      expect(style('alert', index).backgroundColor).toBe('rgb(255, 255, 255)')
      expect(px(style('alert', index).borderTopLeftRadius)).toBe(10)
    }

    expect(style('alert-title', 0).color).toBe(roleColor('info'))
    expect(style('alert-icon', 0).color).toBe(roleColor('info'))
    expect(style('alert-title', 1).color).toBe(roleColor('error'))
    expect(style('alert-icon', 1).color).toBe(roleColor('error'))
    expect(style('alert-message', 0).color).toBe('rgb(10, 10, 10)')
  })

  it('paints the badges tinted, apart from the primary and the error ones that are solid', () => {
    show(
      <>
        <Badge variant="neutral">Neutral</Badge>
        <Badge variant="primary">Primary</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="error">Error</Badge>
      </>
    )

    expect(style('badge', 0).backgroundColor).toBe('rgb(245, 245, 245)')
    expect(style('badge', 1).backgroundColor).toBe('rgb(23, 23, 23)')
    expect(style('badge', 2).backgroundColor).toBe(roleColor('success-container'))
    expect(style('badge', 3).backgroundColor).toBe(roleColor('error'))
    expect(style('badge', 3).color).toBe(roleColor('on-error'))
    expect(px(style('badge', 0).borderTopLeftRadius)).toBe(8)
  })

  it('draws the card with a border, 14px corners and the page color', () => {
    show(<Card>Content</Card>)

    expect(style('card').borderTopWidth).toBe('1px')
    expect(style('card').borderTopColor).toBe('rgb(229, 229, 229)')
    expect(px(style('card').borderTopLeftRadius)).toBe(14)
    expect(style('card').backgroundColor).toBe('rgb(255, 255, 255)')
  })

  it('draws the dialog with a border, 10px corners, a 512px width and 14px text', async () => {
    show(
      <Modal isOpen onClose={() => undefined} title="Title">
        Body
      </Modal>
    )
    await expect.poll(() => parts('modal-panel').length).toBe(1)
    const panel = style('modal-panel')

    expect(panel.borderTopWidth).toBe('1px')
    expect(panel.borderTopColor).toBe('rgb(229, 229, 229)')
    expect(px(panel.borderTopLeftRadius)).toBe(10)
    expect(px(panel.maxWidth)).toBe(512)
    expect(px(style('modal-body').fontSize)).toBe(14)
  })

  it('draws the drawer with a border on its inner edge, square corners, a 384px width and 14px text', async () => {
    show(
      <Drawer open onClose={() => undefined} title="Title">
        Body
      </Drawer>
    )
    await expect.poll(() => parts('drawer-panel').length).toBe(1)
    const panel = style('drawer-panel')

    expect([panel.borderRightWidth, panel.borderLeftWidth, panel.borderTopWidth]).toEqual(['1px', '0px', '0px'])
    expect(panel.borderRightColor).toBe('rgb(229, 229, 229)')
    expect([px(panel.borderTopRightRadius), px(panel.borderBottomRightRadius)]).toEqual([0, 0])
    expect(panel.backgroundColor).toBe('rgb(255, 255, 255)')
    expect(px(panel.width)).toBe(384)
    expect(px(style('drawer-body').fontSize)).toBe(14)
    expect([px(style('drawer-title').fontSize), style('drawer-title').fontWeight]).toEqual([18, '600'])
  })

  it('draws the menu with 8px by 6px items, 6px corners, 14px regular text, 16px icons and a separator that reaches the border', async () => {
    show(
      <Menu
        defaultOpen
        label="Actions"
        items={[
          { id: 'edit', label: 'Edit', icon: <svg /> },
          { id: 'split', separator: true },
          { id: 'delete', label: 'Delete' }
        ]}
      >
        <button type="button">Open</button>
      </Menu>
    )
    await expect.poll(() => parts('menu-item').length).toBe(2)
    const item = style('menu-item')

    expect([px(item.paddingTop), px(item.paddingBottom), px(item.paddingLeft), px(item.paddingRight)]).toEqual([6, 6, 8, 8])
    expect(px(item.borderTopLeftRadius)).toBe(6)
    expect([px(item.fontSize), item.fontWeight]).toEqual([14, '400'])
    expect(px(style('menu').minWidth)).toBe(128)
    expect([px(style('menu-item-icon').width), px(style('menu-item-icon').height)]).toEqual([16, 16])
    expect(px(style('menu-separator').marginLeft)).toBe(-4)
    expect(px(style('popover-content').borderTopWidth)).toBe(1)
  })

  it('draws the open popover with a border and 8px corners, and the tooltip with 8px corners', async () => {
    show(
      <>
        <Popover defaultOpen content={<p>Content</p>}>
          <button type="button">Open</button>
        </Popover>
        <Tooltip text="Hint">
          <button type="button">Target</button>
        </Tooltip>
      </>
    )
    await userEvent.hover(document.querySelectorAll('button')[1])
    await expect.poll(() => parts('popover-content').length + parts('tooltip-bubble').length).toBe(2)

    expect(style('popover-content').borderTopWidth).toBe('1px')
    expect(px(style('popover-content').borderTopLeftRadius)).toBe(8)
    expect(px(style('tooltip-bubble').borderTopLeftRadius)).toBe(8)
  })

  it('draws the toast neutral, with a border and 8px corners', async () => {
    const Launcher = () => {
      const toast = useToast()

      return (
        <button type="button" onClick={() => toast.success('Saved', 0)}>
          Show
        </button>
      )
    }

    show(<Launcher />)
    await userEvent.click(document.querySelector('button') as HTMLButtonElement)
    await expect.poll(() => parts('toast').length).toBe(1)

    expect(style('toast').borderTopWidth).toBe('1px')
    expect(px(style('toast').borderTopLeftRadius)).toBe(8)
    expect(style('toast').backgroundColor).toBe('rgb(255, 255, 255)')
  })
})

describe('the navigation and the data of the shadcn style', () => {
  it('draws the tabs 36px high in 14px type, with a 2px underline in the text color', () => {
    show(<Tabs items={[{ value: 'a', label: 'One', content: 'First' }]} />)

    expect(px(style('tabs-tab').minHeight)).toBe(36)
    expect(px(style('tabs-tab').fontSize)).toBe(14)
    expect(style('tabs-indicator').borderBottomColor).toBe('rgb(10, 10, 10)')
    expect(style('tabs-indicator').borderBottomWidth).toBe('2px')
  })

  it('draws the accordion flat, with 14px type in the trigger and in the panel and the dividers between items', () => {
    show(
      <Accordion
        defaultValue={['a']}
        items={[
          { value: 'a', title: 'First', content: 'Answer' },
          { value: 'b', title: 'Second', content: 'Answer' }
        ]}
      />
    )

    expect(px(style('accordion-trigger').fontSize)).toBe(14)
    expect(px(style('accordion-panel').fontSize)).toBe(14)
    expect(px(style('accordion').borderTopLeftRadius)).toBe(0)
    expect(colorOf(style('accordion').borderTopColor).a).toBe(0)
    expect(style('accordion-item', 1).borderTopColor).toBe('rgb(229, 229, 229)')
  })

  it('shows the hover of the accordion trigger as a state layer', async () => {
    show(<Accordion items={[{ value: 'a', title: 'First', content: 'Answer' }]} />)
    await userEvent.hover(part('accordion-trigger'))

    await becomes(() => part('accordion-trigger'), 'color', 'rgb(10, 10, 10)')
    await expect.poll(() => getComputedStyle(part('accordion-trigger'), '::after').opacity).toBe('0.08')
  })

  it('draws the table in 14px type with a medium header and 8px cells', () => {
    show(<Table columns={[{ key: 'name', header: 'Name' }]} rows={[{ name: 'Ana' }]} />)

    expect(style('table-header').fontWeight).toBe('500')
    expect(px(style('table-cell').fontSize)).toBe(14)
    expect(px(style('table-cell').paddingTop)).toBe(8)
    expect(px(style('table-cell').paddingLeft)).toBe(8)
  })

  it('draws the current page of the pagination as an outline and the breadcrumbs in 14px type', () => {
    show(
      <>
        <Pagination pageCount={5} defaultPage={2} />
        <Breadcrumbs
          items={[
            { id: 'home', label: 'Home', href: '/' },
            { id: 'now', label: 'Now' }
          ]}
        />
      </>
    )
    const current = document.querySelector('[aria-current="page"]') as HTMLElement

    expect(getComputedStyle(current).borderTopColor).toBe('rgb(229, 229, 229)')
    expect(getComputedStyle(current).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(px(getComputedStyle(current).fontSize)).toBe(14)
    expect(px(style('breadcrumbs-link').fontSize)).toBe(14)
    expect(px(style('breadcrumbs-current').fontSize)).toBe(14)
  })
})

describe('the shadcn style next to the other inputs of the theme', () => {
  it('takes the brand color for the accents and keeps the neutral surfaces', () => {
    show(<Button>Save</Button>, 'light', { style: shadcn, brand: '#0B6BCB' })

    expect(colorOf(style('button').backgroundColor)).not.toMatchObject({ r: 23, g: 23, b: 23 })
    expect(getComputedStyle(document.documentElement).getPropertyValue('--enchase-color-background').trim()).toBe('#FFFFFF')
    expect(getComputedStyle(document.documentElement).getPropertyValue('--enchase-color-surface-container').trim()).toBe('#F5F5F5')
  })

  it('lets the shape and the radius of the caller win over the corners of the style', () => {
    show(
      <>
        <Button>Pill</Button>
        <Button>Wide</Button>
      </>,
      'light',
      { style: shadcn, shape: 'pill' }
    )

    expect(px(style('button', 0).borderTopLeftRadius)).toBeGreaterThanOrEqual(1000)
  })

  it('lets a radius of the caller win over the one of the style', () => {
    show(<Button>Wide</Button>, 'light', { style: shadcn, radius: { button: '2rem' } })

    expect(px(style('button').borderTopLeftRadius)).toBe(32)
  })

  it('lets a hook set on the page win over the hooks of the style', () => {
    onRoot({ '--enchase-button-font-size-md': '20px', '--enchase-input-height': '60px' })
    show(
      <>
        <Button>Save</Button>
        <Input label="Email" />
      </>
    )

    expect(px(style('button').fontSize)).toBe(20)
    expect(px(style('input-field').height)).toBe(60)
  })
})
