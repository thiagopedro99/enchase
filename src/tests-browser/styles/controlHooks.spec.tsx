import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import Badge from '@components/common/Badge/index.tsx'
import Breadcrumbs from '@components/common/Breadcrumbs/index.tsx'
import Button from '@components/common/Button/index.tsx'
import ButtonLink from '@components/common/ButtonLink/index.tsx'
import Input from '@components/common/Input/index.tsx'
import Link from '@components/common/Link/index.tsx'
import Loading from '@components/common/Loading/index.tsx'
import { ConfirmModal } from '@components/common/Modal/index.tsx'
import NumberInput from '@components/common/NumberInput/index.tsx'
import Pagination from '@components/common/Pagination/index.tsx'
import Popover from '@components/common/Popover/index.tsx'
import Select from '@components/common/Select/index.tsx'
import Sidebar from '@components/common/Sidebar/index.tsx'
import Tag from '@components/common/Tag/index.tsx'
import Textarea from '@components/common/Textarea/index.tsx'
import ThemeToggle from '@components/common/ThemeToggle/index.tsx'
import Tooltip from '@components/common/Tooltip/index.tsx'
import Footer from '@components/footer/index.tsx'
import Brand from '@components/layout/subcomponentes/Brand/index.tsx'
import Navbar from '@components/navbar/index.tsx'
import { demoSections } from '@tests/shared/fixtures/layoutBranding.tsx'
import { renderInBrowser } from '../support/harness.tsx'
import { at, becomes, expectHooks, hooked, onRoot, part, parts, setHooks } from '../support/hookProbes.ts'
import { pressMouse, releaseMouse } from '../support/pointer.ts'

import type { Probe } from '../support/hookProbes.ts'
import type { CSSProperties, ReactElement, ReactNode } from 'react'

afterEach(async () => {
  await releaseMouse()
  document.documentElement.removeAttribute('style')
})

const colorOf = (value: string) => value.replace(/\s+/g, '')

const buttons = [
  ['primary', 'rgb(1, 2, 3)', 'rgb(4, 5, 6)'],
  ['secondary', 'rgb(7, 8, 9)', 'rgb(10, 11, 12)'],
  ['outline', 'rgb(13, 14, 15)', undefined],
  ['ghost', 'rgb(13, 14, 15)', undefined],
  ['danger', 'rgb(16, 17, 18)', 'rgb(19, 20, 21)']
] as const

describe('the button from the hooks', () => {
  it('takes the color and the shadow of a hovered button from the hooks of its variant', async () => {
    onRoot({
      '--enchase-button-color-primary-hover': 'rgb(1, 2, 3)',
      '--enchase-button-shadow-primary-hover': '0 0 0 3px rgb(4, 5, 6)',
      '--enchase-button-color-secondary-hover': 'rgb(7, 8, 9)',
      '--enchase-button-shadow-secondary-hover': '0 0 0 3px rgb(10, 11, 12)',
      '--enchase-button-color-outline-hover': 'rgb(13, 14, 15)',
      '--enchase-button-color-danger-hover': 'rgb(16, 17, 18)',
      '--enchase-button-shadow-danger-hover': '0 0 0 3px rgb(19, 20, 21)'
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

describe('the danger button from the hooks', () => {
  it('takes the background, the color and the shadow of a resting danger button from their hooks', () => {
    hooked(
      [
        ['--enchase-button-background-danger', 'rgb(1, 2, 3)', at('button'), 'background-color'],
        ['--enchase-button-color-danger', 'rgb(4, 5, 6)', at('button'), 'color'],
        ['--enchase-button-shadow-danger', '0 0 0 3px rgb(7, 8, 9)', at('button'), 'box-shadow', /rgb\(7, 8, 9\)/]
      ],
      <Button variant="danger">Delete</Button>
    )
  })

  it('leaves the other variants alone when the hooks of the danger variant are set', () => {
    onRoot({ '--enchase-button-background-danger': 'rgb(1, 2, 3)', '--enchase-button-color-danger': 'rgb(4, 5, 6)' })
    renderInBrowser(
      <>
        <Button variant="primary">Save</Button>
        <Button variant="secondary">Later</Button>
      </>
    )

    expect(parts('button').map((button) => [getComputedStyle(button).backgroundColor, getComputedStyle(button).color])).not.toContainEqual(['rgb(1, 2, 3)', 'rgb(4, 5, 6)'])
  })
})

const buttonSizes = ['sm', 'md', 'lg'] as const

const cornerOf = (name: string, index = 0) => parseFloat(getComputedStyle(part(name, index)).borderTopLeftRadius)

describe('the corners of the button from the hooks', () => {
  const buttons = (
    <>
      {buttonSizes.map((size) => (
        <Button key={size} size={size}>
          {size}
        </Button>
      ))}
    </>
  )

  it('takes the corners of each size from its own hook', () => {
    hooked(
      buttonSizes.map((size, index) => [`--enchase-button-radius-${size}`, `${3 + index * 2}px`, at('button', index), 'border-top-left-radius'] satisfies Probe),
      buttons
    )
  })

  it('leaves the other sizes alone when only one size hook is set', () => {
    onRoot({ '--enchase-button-radius-md': '7px' })
    renderInBrowser(buttons)

    expect(cornerOf('button', 0)).toBeGreaterThanOrEqual(1000)
    expect(cornerOf('button', 1)).toBe(7)
    expect(cornerOf('button', 2)).toBeGreaterThanOrEqual(1000)
  })

  it('keeps the corners the theme gives to the button in every size when no hook is set', () => {
    renderInBrowser(buttons)

    expect(buttonSizes.map((_, index) => cornerOf('button', index) >= 1000)).toEqual([true, true, true])
  })

  it('keeps the corners of a shape preset in every size, and a size hook wins over it', () => {
    onRoot({ '--enchase-button-radius-sm': '5px' })
    renderInBrowser(buttons, 'never', 'light', { shape: 'square' })

    expect(buttonSizes.map((_, index) => cornerOf('button', index))).toEqual([5, 4, 4])
  })

  it('falls back to the hook of the button in every size', () => {
    onRoot({ '--enchase-button-radius': '9px' })
    renderInBrowser(buttons)

    expect(buttonSizes.map((_, index) => cornerOf('button', index))).toEqual([9, 9, 9])
  })

  it('lets the hook of a size win over the hook of the button', () => {
    onRoot({ '--enchase-button-radius': '9px', '--enchase-button-radius-md': '2px' })
    renderInBrowser(buttons)

    expect(buttonSizes.map((_, index) => cornerOf('button', index))).toEqual([9, 2, 9])
  })

  it('reaches the buttons of a confirmation and a link that looks like a button, which share the markup', async () => {
    onRoot({ '--enchase-button-radius-md': '6px' })
    renderInBrowser(
      <>
        <ButtonLink href="/docs">Docs</ButtonLink>
        <ConfirmModal isOpen onClose={() => undefined} onConfirm={() => undefined} message="Sure?" />
      </>
    )
    await expect.poll(() => parts('modal-footer').length).toBe(1)

    expect(parts('button').length).toBe(2)
    expect([cornerOf('button-link'), cornerOf('button', 0), cornerOf('button', 1)]).toEqual([6, 6, 6])
  })

  it('does not move the other parts that read the button role of the theme', () => {
    onRoot({ '--enchase-button-radius-sm': '1px', '--enchase-button-radius-md': '1px', '--enchase-button-radius-lg': '1px' })
    renderInBrowser(
      <>
        <Button>Button</Button>
        <Badge>Badge</Badge>
        <Tag>Tag</Tag>
        <Pagination pageCount={3} />
      </>
    )

    expect(cornerOf('button')).toBe(1)
    expect(['badge', 'tag'].map((name) => cornerOf(name) >= 1000)).toEqual([true, true])
    expect(cornerOf('pagination-page')).toBe(8)
  })
})

describe('the background of the outline button from the hook', () => {
  const variants = ['primary', 'secondary', 'outline', 'ghost'] as const

  const backgroundOf = (index: number) => getComputedStyle(part('button', index)).backgroundColor

  const buttons = (disabled = false) => (
    <>
      {variants.map((variant) => (
        <Button key={variant} variant={variant} disabled={disabled}>
          {variant}
        </Button>
      ))}
    </>
  )

  it('takes the background of the outline variant from its hook and leaves the other variants alone', () => {
    onRoot({ '--enchase-button-background-outline': 'rgb(1, 2, 3)' })
    renderInBrowser(buttons())

    const backgrounds = variants.map((_, index) => backgroundOf(index))

    expect(backgrounds[2]).toBe('rgb(1, 2, 3)')
    expect(backgrounds.filter((_, index) => index !== 2)).not.toContain('rgb(1, 2, 3)')
  })

  it('keeps the outline and the ghost variants transparent when the hook is not set', () => {
    renderInBrowser(buttons())

    expect([backgroundOf(2), backgroundOf(3)]).toEqual(['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)'])
  })

  it('keeps a disabled outline button transparent, whatever the hook of the outline variant says', () => {
    onRoot({ '--enchase-button-background-outline': 'rgb(1, 2, 3)' })
    renderInBrowser(buttons(true))

    expect(backgroundOf(2)).toBe('rgba(0, 0, 0, 0)')
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

describe('the line height of the link from the hook', () => {
  const stage = (children: ReactNode, lineHeight = 'normal') => (
    <div style={{ display: 'flex', alignItems: 'flex-start', fontSize: '14px', lineHeight }}>{children}</div>
  )

  const anchors = () => [...document.body.querySelectorAll<HTMLAnchorElement>('a')]

  const heightOf = (element: Element) => element.getBoundingClientRect().height

  const lineHeightOf = (element: Element) => getComputedStyle(element).lineHeight

  const ratioOf = (element: Element) => Math.round((parseFloat(lineHeightOf(element)) / parseFloat(getComputedStyle(element).fontSize)) * 100) / 100

  const inheritedBy = (element: HTMLElement) => {
    const probe = document.createElement('span')

    probe.style.fontSize = getComputedStyle(element).fontSize
    element.parentElement?.append(probe)

    const inherited = lineHeightOf(probe)

    probe.remove()

    return inherited
  }

  const crumbs = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'docs', label: 'Docs', href: '/docs' },
    { id: 'guides', label: 'Guides', href: '/guides' },
    { id: 'page', label: 'Page' }
  ]

  const contexts: [string, ReactElement, string][] = [
    ['the footer', <Footer companyName="Enchase" notice="MIT" links={[{ label: 'Docs', href: '/docs' }]} />, '[data-slot="footer-link"]'],
    ['the navbar', <Navbar sections={demoSections} />, '[data-slot="navbar-logo"], [data-slot="link"]'],
    ['the sidebar', <Sidebar sections={demoSections} currentHref="/" />, '[data-slot="link"]'],
    ['the brand of the layout', <Brand name="Enchase" />, '[data-slot="brand"]'],
    ['the breadcrumbs next to the current page', <Breadcrumbs items={crumbs} />, '[data-slot="breadcrumbs-item"]:not([data-priority="low"]) [data-slot="breadcrumbs-link"]']
  ]

  const lowCrumbs = () => [...document.body.querySelectorAll<HTMLElement>('[data-slot="breadcrumbs-item"][data-priority="low"] [data-slot="breadcrumbs-link"]')]

  it.each(['normal', '30px', '1.25'])('inherits the line height of its context when no hook is set, as a bare anchor does (%s)', (lineHeight) => {
    renderInBrowser(
      stage(
        <>
          <Link href="/docs">Docs</Link>
          <a href="/bare">Bare</a>
        </>,
        lineHeight
      )
    )
    const [link, bare] = anchors()

    expect(lineHeightOf(link)).toBe(lineHeightOf(bare))
    expect(heightOf(link)).toBe(heightOf(bare))
  })

  it('leaves a standalone link of 14px below the 24px floor of the target when no hook is set', () => {
    renderInBrowser(stage(<Link href="/docs">Docs</Link>))

    expect(heightOf(anchors()[0])).toBeLessThan(24)
  })

  it('takes the line height from its hook, which lifts a standalone link of 14px to the 24px floor of the target with 1.7143', () => {
    onRoot({ '--enchase-link-line-height': '1.7143' })
    renderInBrowser(stage(<Link href="/docs">Docs</Link>))
    const [link] = anchors()

    expect(parseFloat(lineHeightOf(link))).toBeCloseTo(24, 1)
    expect(heightOf(link)).toBeGreaterThanOrEqual(24)
    expect(heightOf(link)).toBeLessThan(24.1)
  })

  it('takes the hook from a wrapper of the page and from the style of the link itself', () => {
    renderInBrowser(
      <div style={{ '--enchase-link-line-height': '2' } as CSSProperties}>
        <Link href="/first">First</Link>
        <Link href="/second" style={{ '--enchase-link-line-height': '3' } as CSSProperties}>
          Second
        </Link>
      </div>
    )

    expect(anchors().map(ratioOf)).toEqual([2, 3])
  })

  it.each(contexts)('keeps the line height of the links of %s as they inherit it when no hook is set', (_name, ui, selector) => {
    renderInBrowser(<div style={{ lineHeight: '2.5' }}>{ui}</div>)
    const links = [...document.body.querySelectorAll<HTMLElement>(selector)]

    expect(links.length).toBeGreaterThan(0)
    expect(links.map(lineHeightOf)).toEqual(links.map(inheritedBy))
  })

  it.each(contexts)('lets the hook reach the links of %s', (_name, ui, selector) => {
    onRoot({ '--enchase-link-line-height': '2' })
    renderInBrowser(ui)
    const links = [...document.body.querySelectorAll<HTMLElement>(selector)]

    expect(links.length).toBeGreaterThan(0)
    expect(links.map(ratioOf)).toEqual(links.map(() => 2))
  })

  it('keeps the line height the low priority crumbs of the breadcrumbs set for themselves, with and without the hook', () => {
    const { unmount } = renderInBrowser(<Breadcrumbs items={crumbs} />)
    const without = lowCrumbs().map(lineHeightOf)

    unmount()
    onRoot({ '--enchase-link-line-height': '2' })
    renderInBrowser(<Breadcrumbs items={crumbs} />)

    expect([without, lowCrumbs().map(lineHeightOf)]).toEqual([
      ['28px', '28px'],
      ['28px', '28px']
    ])
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
      ['--enchase-popover-content-padding-inline', '19px', at('popover-body'), 'padding-left']
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

  it('takes the border of the content and of the arrow from the border hooks, and keeps the arrow on the outer edge of the border', async () => {
    const probes = [
      ['--enchase-popover-content-border-width', '3px', at('popover-content'), 'border-top-width'],
      ['--enchase-popover-content-border-width', '3px', at('popover-arrow'), 'border-top-width'],
      ['--enchase-popover-content-border-width', '3px', at('popover-arrow'), 'border-left-width'],
      ['--enchase-popover-content-border-width', '3px', at('popover-arrow'), 'border-bottom-width', '0px'],
      ['--enchase-popover-content-border-color', 'rgb(7, 8, 9)', at('popover-content'), 'border-top-color'],
      ['--enchase-popover-content-border-color', 'rgb(7, 8, 9)', at('popover-arrow'), 'border-top-color']
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
    const arrow = part('popover-arrow').getBoundingClientRect()

    expectHooks(probes)
    expect(arrow.top + arrow.height / 2).toBeCloseTo(part('popover-content').getBoundingClientRect().top, 0)
  })

  it('keeps the arrow on the edge of the box when the border width is written without a unit', async () => {
    onRoot({ '--enchase-popover-content-border-width': '0' })
    renderInBrowser(
      <div style={{ padding: '4rem' }}>
        <Popover defaultOpen arrow content={<p>Content</p>}>
          <button type="button">Open</button>
        </Popover>
      </div>
    )
    await expect.poll(() => parts('popover-content').length).toBe(1)
    const arrow = part('popover-arrow').getBoundingClientRect()

    expect(arrow.top + arrow.height / 2).toBeCloseTo(part('popover-content').getBoundingClientRect().top, 0)
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
