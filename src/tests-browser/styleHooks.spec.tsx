import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Alert } from '@components/common/Alert/index.tsx'
import { Button } from '@components/common/Button/index.tsx'
import { Card } from '@components/common/Card/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { NumberInput } from '@components/common/NumberInput/index.tsx'
import Popover from '@components/common/Popover/index.tsx'
import { RadioGroup } from '@components/common/RadioGroup/index.tsx'
import { Select } from '@components/common/Select/index.tsx'
import { Sidebar } from '@components/common/Sidebar/index.tsx'
import { Switch } from '@components/common/Switch/index.tsx'
import { Textarea } from '@components/common/Textarea/index.tsx'
import Tooltip from '@components/common/Tooltip/index.tsx'
import Navbar from '@components/navbar/index.tsx'
import { useToast } from '@components/toast/index.ts'
import { renderInBrowser } from './harness.tsx'
import { at, becomes, expectHooks, hooked, onRoot, part, parts, setHooks } from './hookProbes.ts'

import type { Probe } from './hookProbes.ts'
import type { ReactElement } from 'react'

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

const options = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' }
]

const sections = [{ id: 'main', title: 'Main', items: [{ id: 'home', label: 'Home', href: '/' }] }]

const fields: { name: string; ui: (props: { error?: string; disabled?: boolean }) => ReactElement }[] = [
  { name: 'input', ui: ({ error, disabled }) => <Input label="Name" labelPlacement="stacked" error={error} disabled={disabled} /> },
  { name: 'number-input', ui: ({ error, disabled }) => <NumberInput label="Amount" labelPlacement="stacked" error={error} disabled={disabled} /> },
  { name: 'select', ui: ({ error, disabled }) => <Select label="Pick" labelPlacement="stacked" options={options} error={error} disabled={disabled} /> },
  { name: 'textarea', ui: ({ error, disabled }) => <Textarea label="Notes" labelPlacement="stacked" error={error} disabled={disabled} /> }
]

describe.each(fields)('the stacked label of the $name from the hooks', ({ name, ui }) => {
  const label = at(`${name}-label`)

  it('takes the size, the weight, the line height and the color of the label from their hooks', () => {
    hooked(
      [
        ['--enchase-input-label-font-size-stacked', '19px', label, 'font-size'],
        ['--enchase-input-label-font-weight-stacked', '650', label, 'font-weight'],
        ['--enchase-input-label-line-height-stacked', '31px', label, 'line-height'],
        ['--enchase-input-label-color-stacked', 'rgb(1, 2, 3)', label, 'color']
      ],
      ui({})
    )
  })

  it('takes the color of the label of a field with an error from its hook', () => {
    hooked([['--enchase-input-label-color-stacked-error', 'rgb(4, 5, 6)', label, 'color']], ui({ error: 'Wrong' }))
  })

  it('takes the color of the label of a disabled field from its hook', () => {
    hooked([['--enchase-input-label-color-stacked-disabled', 'rgb(7, 8, 9)', label, 'color']], ui({ disabled: true }))
  })

  it('takes the shadow of the outline while focused from its hook', async () => {
    onRoot({ '--enchase-input-outline-shadow-focus': '0 0 0 4px rgb(7, 8, 9)' })
    renderInBrowser(ui({}))
    part(`${name}-field`).focus()

    await becomes(at(`${name}-outline`), 'box-shadow', /rgb\(7, 8, 9\)/)
  })
})

describe('the disabled opacity of the selection controls from the hooks', () => {
  it('takes the opacity of a disabled radio and of a disabled switch from their hooks', () => {
    hooked(
      [
        ['--enchase-radio-group-opacity-disabled', '0.37', at('radio-group-control', 1), 'opacity'],
        ['--enchase-radio-group-opacity-disabled', '0.37', at('radio-group-label', 1), 'opacity'],
        ['--enchase-switch-opacity-disabled', '0.41', at('switch-track'), 'opacity'],
        ['--enchase-switch-opacity-disabled', '0.41', at('switch-label'), 'opacity']
      ],
      <>
        <RadioGroup
          label="Plan"
          options={[
            { value: 'a', label: 'A' },
            { value: 'b', label: 'B', disabled: true }
          ]}
        />
        <Switch label="Alerts" disabled />
      </>
    )
  })
})

describe('the disabled button from the hooks', () => {
  const variants = ['primary', 'secondary', 'outline', 'ghost'] as const

  const buttons = (
    <>
      {variants.map((variant) => (
        <Button key={variant} variant={variant} disabled>
          {variant}
        </Button>
      ))}
    </>
  )

  it('takes the color of every disabled button from the shared hook when the hook of the variant is not set', () => {
    hooked(
      variants.map((_, index) => ['--enchase-button-color-disabled', 'rgb(1, 2, 3)', at('button', index), 'color'] satisfies Probe),
      buttons
    )
  })

  it('takes the colors, the border and the opacity of each variant while disabled from the hooks of the variant', () => {
    const probes: Probe[] = variants.flatMap((variant, index) => {
      const step = index * 3

      return [
        [`--enchase-button-color-${variant}-disabled`, `rgb(${step + 1}, 2, 3)`, at('button', index), 'color'],
        [`--enchase-button-background-${variant}-disabled`, `rgb(${step + 2}, 5, 6)`, at('button', index), 'background-color'],
        [`--enchase-button-border-color-${variant}-disabled`, `rgb(${step + 3}, 8, 9)`, at('button', index), 'border-top-color']
      ] satisfies Probe[]
    })

    hooked([...probes, ['--enchase-button-opacity-disabled', '0.43', at('button'), 'opacity']], buttons)
  })

  it('takes the shadow of the ghost and of the outline buttons from their hooks', () => {
    hooked(
      [
        ['--enchase-button-shadow-outline', '0 0 0 3px rgb(1, 2, 3)', at('button', 0), 'box-shadow', /rgb\(1, 2, 3\)/],
        ['--enchase-button-shadow-ghost', '0 0 0 3px rgb(4, 5, 6)', at('button', 1), 'box-shadow', /rgb\(4, 5, 6\)/]
      ],
      <>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </>
    )
  })
})

describe('the borders of the surfaces from the hooks', () => {
  const border = (width: string, color: string): [string, string] => [width, color]

  it('takes the width and the color of the border of the alert and of the card from their hooks', () => {
    const [width, color] = border('3px', 'rgb(1, 2, 3)')

    hooked(
      [
        ['--enchase-alert-border-width', width, at('alert'), 'border-top-width'],
        ['--enchase-alert-border-color', color, at('alert'), 'border-top-color'],
        ['--enchase-card-border-width-default', '5px', at('card'), 'border-top-width'],
        ['--enchase-card-border-color-default', color, at('card'), 'border-top-color']
      ],
      <>
        <Alert variant="info">Message</Alert>
        <Card>Content</Card>
      </>
    )
  })

  it('takes the colors of the title and of the icon of an alert from the hooks of its variant', () => {
    const variants = ['info', 'success', 'warning', 'error'] as const

    hooked(
      variants.flatMap((variant, index) => [
        [`--enchase-alert-title-color-${variant}`, `rgb(${index + 1}, 2, 3)`, at('alert-title', index), 'color'],
        [`--enchase-alert-icon-color-${variant}`, `rgb(${index + 1}, 5, 6)`, at('alert-icon', index), 'color']
      ]) as Probe[],
      <>
        {variants.map((variant) => (
          <Alert key={variant} variant={variant} title={variant}>
            Message
          </Alert>
        ))}
      </>
    )
  })

  it('takes the width and the color of the border of the dialog and of its colors from their hooks', async () => {
    const probes: Probe[] = [
      ['--enchase-modal-panel-border-width', '3px', at('modal-panel'), 'border-top-width'],
      ['--enchase-modal-panel-border-color', 'rgb(1, 2, 3)', at('modal-panel'), 'border-top-color'],
      ['--enchase-modal-body-font-size', '13px', at('modal-body'), 'font-size']
    ]

    setHooks(probes)
    renderInBrowser(
      <Modal isOpen onClose={() => undefined} title="Title">
        Body
      </Modal>
    )
    await expect.poll(() => parts('modal-panel').length).toBe(1)

    expectHooks(probes)
  })

  it('takes the width and the color of the border of the popover from their hooks', async () => {
    const probes: Probe[] = [
      ['--enchase-popover-content-border-width', '3px', at('popover-content'), 'border-top-width'],
      ['--enchase-popover-content-border-color', 'rgb(1, 2, 3)', at('popover-content'), 'border-top-color']
    ]

    setHooks(probes)
    renderInBrowser(
      <div style={{ padding: '4rem' }}>
        <Popover defaultOpen content={<p>Content</p>}>
          <button type="button">Open</button>
        </Popover>
      </div>
    )
    await expect.poll(() => parts('popover-content').length).toBe(1)

    expectHooks(probes)
  })

  it('takes the width and the color of the border of a toast from their hooks', async () => {
    const Launcher = () => {
      const toast = useToast()

      return (
        <button type="button" onClick={() => toast.info('Saved', 0)}>
          Show
        </button>
      )
    }

    const probes: Probe[] = [
      ['--enchase-toast-border-width', '3px', at('toast'), 'border-top-width'],
      ['--enchase-toast-border-color', 'rgb(1, 2, 3)', at('toast'), 'border-top-color']
    ]

    setHooks(probes)
    renderInBrowser(<Launcher />)
    await userEvent.click(document.querySelector('button') as HTMLButtonElement)
    await expect.poll(() => parts('toast').length).toBe(1)

    expectHooks(probes)
  })

  it('takes the width and the color of the bottom border of the navbar from their hooks', () => {
    hooked(
      [
        ['--enchase-navbar-border-width', '3px', at('navbar'), 'border-bottom-width'],
        ['--enchase-navbar-border-color', 'rgb(1, 2, 3)', at('navbar'), 'border-bottom-color']
      ],
      <Navbar sections={sections} />
    )
  })

  it('takes the width and the color of the side border of the sidebar from their hooks', () => {
    hooked(
      [
        ['--enchase-sidebar-border-width', '3px', at('sidebar'), 'border-right-width'],
        ['--enchase-sidebar-border-color', 'rgb(1, 2, 3)', at('sidebar'), 'border-right-color']
      ],
      <Sidebar variant="permanent" currentHref="/" sections={sections} onToggleCollapsed={() => undefined} />
    )
  })
})

describe('the select picker and the tooltip from the hooks', () => {
  const baseSelect = CSS.supports('appearance', 'base-select')

  const field = () => document.querySelector('select') as HTMLSelectElement

  it.runIf(baseSelect)('takes the width and the color of the border of the picker from their hooks', () => {
    hooked(
      [
        ['--enchase-select-picker-border-width', '3px', field, 'border-top-width', undefined, '::picker(select)'],
        ['--enchase-select-picker-border-color', 'rgb(1, 2, 3)', field, 'border-top-color', undefined, '::picker(select)']
      ],
      <Select label="Pick" options={options} />
    )
  })

  it('takes the padding of the bubble of a tooltip from its hook', async () => {
    onRoot({ '--enchase-tooltip-bubble-padding': '7px 13px' })
    renderInBrowser(
      <Tooltip text="Hint">
        <button type="button">Target</button>
      </Tooltip>
    )
    await userEvent.hover(document.querySelector('button') as HTMLButtonElement)
    await expect.poll(() => parts('tooltip-bubble').length).toBe(1)

    expect(getComputedStyle(part('tooltip-bubble')).paddingTop).toBe('7px')
    expect(getComputedStyle(part('tooltip-bubble')).paddingLeft).toBe('13px')
  })
})
