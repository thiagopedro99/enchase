import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import Button from '@components/common/Button/index.tsx'
import Input from '@components/common/Input/index.tsx'
import Link from '@components/common/Link/index.tsx'
import Loading from '@components/common/Loading/index.tsx'
import { ConfirmModal } from '@components/common/Modal/index.tsx'
import NumberInput from '@components/common/NumberInput/index.tsx'
import Popover from '@components/common/Popover/index.tsx'
import Select from '@components/common/Select/index.tsx'
import Textarea from '@components/common/Textarea/index.tsx'
import ThemeToggle from '@components/common/ThemeToggle/index.tsx'
import Tooltip from '@components/common/Tooltip/index.tsx'
import { renderInBrowser } from './harness.tsx'
import { at, becomes, expectHooks, hooked, onRoot, part, parts, setHooks } from './hookProbes.ts'
import { pressMouse, releaseMouse } from './pointer.ts'

import type { ReactElement } from 'react'

afterEach(async () => {
  await releaseMouse()
  document.documentElement.removeAttribute('style')
})

const colorOf = (value: string) => value.replace(/\s+/g, '')

const buttons = [
  ['primary', 'rgb(1, 2, 3)', 'rgb(4, 5, 6)'],
  ['secondary', 'rgb(7, 8, 9)', 'rgb(10, 11, 12)'],
  ['outline', 'rgb(13, 14, 15)', undefined],
  ['ghost', 'rgb(13, 14, 15)', undefined]
] as const

describe('the button from the hooks', () => {
  it('takes the color and the shadow of a hovered button from the hooks of its variant', async () => {
    onRoot({
      '--enchase-button-color-primary-hover': 'rgb(1, 2, 3)',
      '--enchase-button-shadow-primary-hover': '0 0 0 3px rgb(4, 5, 6)',
      '--enchase-button-color-secondary-hover': 'rgb(7, 8, 9)',
      '--enchase-button-shadow-secondary-hover': '0 0 0 3px rgb(10, 11, 12)',
      '--enchase-button-color-outline-hover': 'rgb(13, 14, 15)'
    })
    renderInBrowser(
      <>
        {buttons.map(([variant]) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </>
    )

    for (const [index, [, color, shadow]] of buttons.entries()) {
      const button = () => parts('button')[index]

      await userEvent.hover(button())
      await becomes(button, 'color', color)

      if (shadow) await becomes(button, 'box-shadow', new RegExp(shadow.replace(/[()]/g, '\\$&')))
    }
  })
})

const options = [
  { value: 'a', label: 'A' },
  { value: 'b', label: 'B' }
]

const fields: { name: string; placeholder: boolean; ui: (error?: string) => ReactElement }[] = [
  { name: 'input', placeholder: true, ui: (error) => <Input label="Name" placeholder="Type" error={error} /> },
  { name: 'number-input', placeholder: true, ui: (error) => <NumberInput label="Amount" placeholder="0" error={error} /> },
  { name: 'select', placeholder: false, ui: (error) => <Select label="Pick" options={options} error={error} /> },
  { name: 'textarea', placeholder: true, ui: (error) => <Textarea label="Notes" placeholder="Type" error={error} /> }
]

describe.each(fields)('the $name field from the shared hooks', ({ name, placeholder, ui }) => {
  const field = () => part(`${name}-field`) as HTMLElement

  const outline = at(`${name}-outline`)

  const label = at(`${name}-label`)

  it.runIf(placeholder)('takes the color of the placeholder from its hook', () => {
    hooked([['--enchase-input-field-color-placeholder', 'rgb(1, 2, 3)', field, 'color', undefined, '::placeholder']], ui())
  })

  it('takes the colors of the label and of the outline while focused from their hooks', async () => {
    onRoot({ '--enchase-input-label-color-focus': 'rgb(1, 2, 3)', '--enchase-input-outline-border-color-focus': 'rgb(4, 5, 6)' })
    renderInBrowser(ui())
    field().focus()

    await becomes(label, 'color', 'rgb(1, 2, 3)')
    await becomes(outline, 'border-top-color', 'rgb(4, 5, 6)')
  })

  it('takes the colors of the label and of the outline of a field with an error while focused from their hooks', async () => {
    onRoot({ '--enchase-input-label-color-error-focus': 'rgb(1, 2, 3)', '--enchase-input-outline-border-color-error-focus': 'rgb(4, 5, 6)' })
    renderInBrowser(ui('Wrong'))
    field().focus()

    await becomes(label, 'color', 'rgb(1, 2, 3)')
    await becomes(outline, 'border-top-color', 'rgb(4, 5, 6)')
  })

  it('takes the color of the outline under the pointer from its hook, with and without an error', async () => {
    onRoot({ '--enchase-input-outline-border-color-hover': 'rgb(1, 2, 3)', '--enchase-input-outline-border-color-error-hover': 'rgb(4, 5, 6)' })

    const { unmount } = renderInBrowser(ui())

    await userEvent.hover(field())
    await becomes(outline, 'border-top-color', 'rgb(1, 2, 3)')
    unmount()
    renderInBrowser(ui('Wrong'))
    await userEvent.hover(field())
    await becomes(outline, 'border-top-color', 'rgb(4, 5, 6)')
  })
})

describe('the fields and the steppers from the hooks', () => {
  it('takes the color of the visibility toggle of a password while hovered and while disabled from their hooks', async () => {
    onRoot({ '--enchase-input-toggle-color-hover': 'rgb(1, 2, 3)', '--enchase-input-toggle-color-disabled': 'rgb(4, 5, 6)' })

    const { unmount } = renderInBrowser(<Input label="Password" type="password" />)

    await userEvent.hover(part('input-toggle'))
    await becomes(at('input-toggle'), 'color', 'rgb(1, 2, 3)')
    unmount()
    renderInBrowser(<Input label="Password" type="password" disabled />)

    await becomes(at('input-toggle'), 'color', 'rgb(4, 5, 6)')
  })

  it('takes the color of a hovered stepper of the number field from its hook', async () => {
    onRoot({ '--enchase-number-input-stepper-color-hover': 'rgb(1, 2, 3)' })
    renderInBrowser(<NumberInput label="Amount" />)
    await userEvent.hover(part('number-input-increase'))

    await becomes(at('number-input-increase'), 'color', 'rgb(1, 2, 3)')
  })
})

describe('the link and the theme toggle from the hooks', () => {
  it('takes the color of a hovered link and of a pressed link from their hooks', async () => {
    onRoot({ '--enchase-link-color-hover': 'rgb(1, 2, 3)', '--enchase-link-color-active': 'rgb(4, 5, 6)' })
    renderInBrowser(<Link href="/docs">Docs</Link>)

    const link = () => document.querySelector('a') as HTMLAnchorElement

    link().draggable = false
    await userEvent.hover(link())
    await becomes(link, 'color', 'rgb(1, 2, 3)')
    await pressMouse('a')
    await becomes(link, 'color', 'rgb(4, 5, 6)')
  })

  it('takes the color of the hovered theme toggle from its hook', async () => {
    onRoot({ '--enchase-theme-toggle-color-hover': 'rgb(1, 2, 3)' })
    renderInBrowser(<ThemeToggle />)
    await userEvent.hover(document.querySelector('button') as HTMLButtonElement)

    await becomes(() => document.querySelector('button'), 'color', 'rgb(1, 2, 3)')
  })
})

describe('the loading from the hooks', () => {
  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const

  it('takes the width, the height and the thickness of each spinner size from their hooks', () => {
    hooked(
      sizes.flatMap((size, index) => [
        [`--enchase-loading-spinner-width-${size}`, `${31 + index * 2}px`, at('loading-spinner', index), 'width'],
        [`--enchase-loading-spinner-height-${size}`, `${33 + index * 2}px`, at('loading-spinner', index), 'height'],
        [`--enchase-loading-spinner-border-width-${size}`, `${7 + index}px`, at('loading-spinner', index), 'border-top-width']
      ]),
      <>
        {sizes.map((size) => (
          <Loading key={size} size={size} />
        ))}
      </>
    )
  })

  it('takes the color of the backdrop of an overlay from its hook', () => {
    hooked([['--enchase-loading-backdrop-background', 'rgb(1, 2, 3)', at('loading-backdrop'), 'background-color']], <Loading overlay />)
  })
})

describe('the modal, the popover and the tooltip from the hooks', () => {
  it('takes the gap of the buttons of a confirmation from its hook', () => {
    hooked(
      [['--enchase-modal-footer-gap', '17px', () => part('modal-footer')?.querySelector('[data-slot="flex"]'), 'column-gap']],
      <ConfirmModal isOpen onClose={() => undefined} onConfirm={() => undefined} message="Sure?" />
    )
  })

  it('takes the size of the arrow, the colors and the padding of the content from their hooks', async () => {
    const probes = [
      ['--enchase-popover-arrow-size', '12px', at('popover-arrow'), 'width'],
      ['--enchase-popover-arrow-size', '12px', at('popover-arrow'), 'height'],
      ['--enchase-popover-arrow-size', '12px', at('popover-arrow'), 'top', '-6px'],
      ['--enchase-popover-content-background', 'rgb(1, 2, 3)', at('popover-content'), 'background-color'],
      ['--enchase-popover-content-color', 'rgb(4, 5, 6)', at('popover-content'), 'color'],
      ['--enchase-popover-content-padding-inline', '19px', at('popover-content'), 'padding-left']
    ] as Parameters<typeof expectHooks>[0]

    setHooks(probes)
    renderInBrowser(
      <div style={{ padding: '4rem' }}>
        <Popover defaultOpen arrow content={<p>Content</p>}>
          <button type="button">Open</button>
        </Popover>
      </div>
    )
    await expect.poll(() => parts('popover-content').length).toBe(1)

    expectHooks(probes)
  })

  it('takes the color of the bubble of a tooltip from its hook', async () => {
    onRoot({ '--enchase-tooltip-bubble-color': 'rgb(1, 2, 3)' })
    renderInBrowser(
      <Tooltip text="Hint">
        <button type="button">Target</button>
      </Tooltip>
    )
    await userEvent.hover(document.querySelector('button') as HTMLButtonElement)
    await expect.poll(() => parts('tooltip-bubble').length).toBe(1)

    expect(colorOf(getComputedStyle(part('tooltip-bubble')).color)).toBe('rgb(1,2,3)')
  })
})

describe('the select picker from the hooks', () => {
  const baseSelect = CSS.supports('appearance', 'base-select')

  const field = () => document.querySelector('select') as HTMLSelectElement

  it.runIf(baseSelect)('takes the margin, the padding, the color and the shadow of the picker from their hooks', () => {
    hooked(
      [
        ['--enchase-select-picker-margin-block', '11px', field, 'margin-top', undefined, '::picker(select)'],
        ['--enchase-select-picker-padding', '13px', field, 'padding-top', undefined, '::picker(select)'],
        ['--enchase-select-picker-background', 'rgb(1, 2, 3)', field, 'background-color', undefined, '::picker(select)'],
        ['--enchase-select-picker-shadow', '0 0 0 3px rgb(7, 8, 9)', field, 'box-shadow', /rgb\(7, 8, 9\)/, '::picker(select)']
      ],
      <Select label="Pick" options={options} />
    )
  })

  it.runIf(!baseSelect)('takes the background of the options of the native list from its hook', () => {
    hooked([['--enchase-select-option-background', 'rgb(4, 5, 6)', () => field().querySelectorAll('option')[1], 'background-color']], <Select label="Pick" options={options} />)
  })
})
