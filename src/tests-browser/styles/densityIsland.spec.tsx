import { afterEach, describe, expect, it } from 'vitest'
import { useEffect } from 'react'

import { differences, gallery, lengthsOf, setDensity, settledCapture } from '../support/density.tsx'
import { DatePicker } from '@components/common/DatePicker/index.tsx'
import { Combobox } from '@components/common/Combobox/index.tsx'
import { builtInStyles } from '@tests/shared/fixtures/styles.ts'
import { Popover } from '@components/common/Popover/index.tsx'
import { Button } from '@components/common/Button/index.tsx'
import { Drawer } from '@components/common/Drawer/index.tsx'
import { Modal } from '@components/common/Modal/index.tsx'
import { Menu } from '@components/common/Menu/index.tsx'
import { renderInBrowser } from '../support/harness.tsx'
import { useToast } from '@components/toast/index.ts'
import { densities } from '@styles/tokens/index.ts'

import type { ReactElement } from 'react'

const styles = ['enchase', 'shadcn'] as const

const places = ['wrapper', 'body'] as const

type StyleName = (typeof styles)[number]

type Attributes = { root?: string; body?: string; wrapper?: string }

type Overlay = { name: string; ui: ReactElement; target: string }

const noop = () => undefined

const variables = [...Object.keys(densities.compact.tokens), '--enchase-hit-size-lg', '--enchase-space-xs', ...Object.keys(densities.compact.hooks)]

const entries = [
  { id: 'edit', label: 'Edit' },
  { id: 'copy', label: 'Copy' }
]

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' }
]

const Notifier = () => {
  const toast = useToast()

  useEffect(() => {
    toast.info('Saved', 0)
  }, [toast])

  return null
}

const overlays: Overlay[] = [
  { name: 'the menu', ui: <Menu defaultOpen label="Actions" items={entries}><Button>Open</Button></Menu>, target: '[data-slot=menu-item]' },
  { name: 'the popover', ui: <Popover defaultOpen content={<p>Hello there</p>}><Button>Open</Button></Popover>, target: '[data-slot=popover-content]' },
  { name: 'the list of the combobox', ui: <Combobox defaultOpen label="Fruit" options={fruits} />, target: '[data-slot=combobox-option]' },
  { name: 'the calendar of the date picker', ui: <DatePicker defaultOpen label="Date" />, target: '[data-slot=date-picker-calendar-day]' },
  { name: 'the modal', ui: <Modal isOpen onClose={noop} title="Title">Body</Modal>, target: '[data-slot=modal-close]' },
  { name: 'the drawer', ui: <Drawer open onClose={noop} title="Title">Body</Drawer>, target: '[data-slot=drawer-close]' },
  { name: 'the toast', ui: <Notifier />, target: '[data-slot=toast-close]' }
]

const observe = async (ui: ReactElement, styleName: StyleName, attributes: Attributes = {}, target = '[data-slot]') => {
  setDensity(attributes.root ?? null)
  document.body.removeAttribute('data-density')
  if (attributes.body !== undefined) document.body.setAttribute('data-density', attributes.body)

  const view = renderInBrowser(
    <div data-testid="wrapper" data-density={attributes.wrapper}>
      {ui}
    </div>,
    'never',
    'light',
    { style: builtInStyles[styleName] }
  )
  const wrapper = view.getByTestId('wrapper')

  await expect.poll(() => document.querySelector(target), { timeout: 4000 }).not.toBeNull()

  const parts = await settledCapture(document.body)
  const popup = document.querySelector(target) as Element
  const part = wrapper.querySelector('[data-slot=button]') ?? wrapper
  const reads = {
    wrapper: lengthsOf(wrapper, variables),
    part: lengthsOf(part, variables),
    body: lengthsOf(document.body, variables),
    root: lengthsOf(document.documentElement, variables)
  }
  const outside = !wrapper.contains(popup)

  view.unmount()

  return { parts, reads, outside }
}

afterEach(() => {
  document.body.removeAttribute('data-density')
})

describe.each(styles)('the compact density on an element that is not the root, in the %s style', (styleName) => {
  describe.each(places)('with the attribute on the %s', (place) => {
    it('changes no measure of any part of the gallery, nor any variable that a part reads', async () => {
      const without = await observe(gallery, styleName)
      const within = await observe(gallery, styleName, { [place]: 'compact' })

      expect(without.parts.length).toBeGreaterThan(150)
      expect(differences(without.parts, within.parts)).toEqual([])
      expect(within.reads).toEqual(without.reads)
    })

    it.each(overlays)('changes no measure of $name, which goes to the body, nor any variable that it reads', async ({ ui, target }) => {
      const without = await observe(ui, styleName, {}, target)
      const within = await observe(ui, styleName, { [place]: 'compact' }, target)

      expect(within.outside).toBe(true)
      expect(without.parts.length).toBeGreaterThan(5)
      expect(differences(without.parts, within.parts)).toEqual([])
      expect(within.reads).toEqual(without.reads)
    })
  })

  it('does change the same measures and variables with the attribute on the root, so the measures above can tell', async () => {
    const without = await observe(gallery, styleName)
    const onRoot = await observe(gallery, styleName, { root: 'compact' })

    expect(differences(without.parts, onRoot.parts).length).toBeGreaterThan(80)
    expect(onRoot.reads.root).not.toEqual(without.reads.root)
    expect(onRoot.reads.wrapper).toEqual(onRoot.reads.root)
    expect(onRoot.reads.part).toEqual(onRoot.reads.root)
    expect(onRoot.reads.body).toEqual(onRoot.reads.root)
  })

  it('has no way back to the default inside a compact root, because a wrapper that says default changes nothing', async () => {
    const onRoot = await observe(gallery, styleName, { root: 'compact' })
    const inside = await observe(gallery, styleName, { root: 'compact', wrapper: 'default' })

    expect(differences(onRoot.parts, inside.parts)).toEqual([])
    expect(inside.reads).toEqual(onRoot.reads)
  })
})

describe('the theme, which does follow an element that is not the root, unlike the density', () => {
  it('recolors a button inside a wrapper that has data-theme', () => {
    const color = () => getComputedStyle(document.querySelector('[data-slot=button]') as Element).backgroundColor
    const light = renderInBrowser(
      <div>
        <Button>Save</Button>
      </div>
    )
    const initial = color()

    light.unmount()

    const dark = renderInBrowser(
      <div data-theme="dark">
        <Button>Save</Button>
      </div>
    )

    expect(color()).not.toBe(initial)

    dark.unmount()
  })
})
