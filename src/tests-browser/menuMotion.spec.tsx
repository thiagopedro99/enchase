import { afterEach, describe, expect, it } from 'vitest'
import { cdp, page, userEvent } from 'vitest/browser'

import Layout from '@components/layout/index.tsx'
import { demoSections } from '@tests/shared/fixtures/layoutBranding.tsx'
import { renderInBrowser } from './harness.tsx'

const setReducedMotion = (value: 'reduce' | 'no-preference') => cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value }] })

afterEach(() => setReducedMotion('no-preference'))

const asideOf = () => document.querySelector('[data-slot="sidebar"]') as HTMLElement

const mainOf = () => document.querySelector('[data-slot="layout-main"]') as HTMLElement

const labelOf = () => document.querySelector('[data-slot="sidebar-item-label"]') as HTMLElement | null

const collapse = () => page.getByRole('button', { name: 'Recolher menu lateral' })

const expand = () => page.getByRole('button', { name: 'Expandir menu lateral' })

const Page = () => (
  <Layout brand="Enchase" navigationSections={demoSections}>
    <h1>Conteúdo</h1>
  </Layout>
)

const sample = async (read: () => number, frames: number) => {
  const values: number[] = []

  for (let index = 0; index < frames; index += 1) {
    values.push(read())
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
  }

  return values
}

describe('Sidebar collapse motion in a real browser', () => {
  it('grows and shrinks through intermediate widths instead of snapping', async () => {
    renderInBrowser(<Page />, 'auto')
    expect(Math.round(asideOf().getBoundingClientRect().width)).toBe(280)

    await userEvent.click(collapse())
    const widths = await sample(() => asideOf().getBoundingClientRect().width, 20)

    expect(widths.some((width) => width > 90 && width < 270)).toBe(true)
    await expect.poll(() => Math.round(asideOf().getBoundingClientRect().width)).toBe(80)
  })

  it('moves the content column together with the sidebar on every frame', async () => {
    renderInBrowser(<Page />, 'auto')

    await userEvent.click(collapse())
    const gaps = await sample(() => Math.abs(mainOf().getBoundingClientRect().left - asideOf().getBoundingClientRect().right), 20)

    expect(Math.max(...gaps)).toBeLessThan(1)
  })

  it('passes through collapsing and settles on collapsed, then expanding and expanded', async () => {
    renderInBrowser(<Page />, 'auto')
    expect(asideOf()).toHaveAttribute('data-state', 'expanded')

    await userEvent.click(collapse())
    expect(asideOf()).toHaveAttribute('data-state', 'collapsing')
    await expect.poll(() => asideOf().getAttribute('data-state')).toBe('collapsed')

    await userEvent.click(expand())
    expect(asideOf()).toHaveAttribute('data-state', 'expanding')
    await expect.poll(() => asideOf().getAttribute('data-state')).toBe('expanded')
  })

  it('fades the labels out before the width ends and removes them only once collapsed', async () => {
    renderInBrowser(<Page />, 'auto')
    await userEvent.click(collapse())

    await expect.poll(() => (labelOf() ? Number(getComputedStyle(labelOf() as HTMLElement).opacity) : 0)).toBeLessThan(0.05)
    expect(asideOf().getAttribute('data-state')).toBe('collapsing')
    expect(Math.round(asideOf().getBoundingClientRect().width)).toBeGreaterThan(80)

    await expect.poll(() => asideOf().getAttribute('data-state')).toBe('collapsed')
    expect(labelOf()).toBeNull()
  })

  it('brings the labels back after the width has grown', async () => {
    renderInBrowser(<Page />, 'auto')
    await userEvent.click(collapse())
    await expect.poll(() => asideOf().getAttribute('data-state')).toBe('collapsed')

    await userEvent.click(expand())
    expect(Number(getComputedStyle(labelOf() as HTMLElement).opacity)).toBeLessThan(0.05)
    await expect.poll(() => asideOf().getAttribute('data-state')).toBe('expanded')
    await expect.poll(() => Number(getComputedStyle(labelOf() as HTMLElement).opacity)).toBeGreaterThan(0.95)
  })

  it('keeps the icons in place while the width changes', async () => {
    renderInBrowser(<Page />, 'auto')
    const icon = () => (document.querySelector('[data-slot="sidebar-item-icon"]') as HTMLElement).getBoundingClientRect()
    const start = icon().left

    await userEvent.click(collapse())
    const lefts = await sample(() => icon().left, 12)

    expect(lefts.every((left) => Math.abs(left - start) < 1)).toBe(true)
  })

  it('retargets when toggled in the middle and ends expanded', async () => {
    renderInBrowser(<Page />, 'auto')
    await userEvent.click(collapse())
    await new Promise((resolve) => setTimeout(resolve, 90))
    await userEvent.click(expand())

    await expect.poll(() => asideOf().getAttribute('data-state')).toBe('expanded')
    expect(Math.round(asideOf().getBoundingClientRect().width)).toBe(280)
    expect(labelOf()).not.toBeNull()
  })

  it('snaps at once when the animation is switched off through the motion mode', async () => {
    renderInBrowser(<Page />, 'never')

    await userEvent.click(collapse())

    expect(asideOf()).toHaveAttribute('data-state', 'collapsed')
    expect(Math.round(asideOf().getBoundingClientRect().width)).toBe(80)
    expect(labelOf()).toBeNull()
  })

  it('changes the width at once under reduced motion but still fades the labels', async () => {
    await setReducedMotion('reduce')
    renderInBrowser(<Page />, 'auto')

    await userEvent.click(collapse())

    expect(Math.round(asideOf().getBoundingClientRect().width)).toBe(80)
    expect(asideOf().getAttribute('data-state')).toBe('collapsing')
    expect(labelOf()).not.toBeNull()
    await expect.poll(() => asideOf().getAttribute('data-state')).toBe('collapsed')
  })

  it('takes the duration from the css variable the user overrides', async () => {
    const style = document.createElement('style')
    style.textContent = '[data-slot="sidebar"] { --enchase-sidebar-duration: 40ms !important; }'
    document.head.append(style)
    renderInBrowser(<Page />, 'auto')

    await userEvent.click(collapse())
    await new Promise((resolve) => setTimeout(resolve, 160))

    expect(asideOf().getAttribute('data-state')).toBe('collapsed')
    style.remove()
  })
})

const itemOf = () => document.querySelector('[data-slot="sidebar-item"] a') as HTMLElement

const press = async () => {
  const box = itemOf().getBoundingClientRect()
  const x = box.left + box.width / 2
  const y = box.top + box.height / 2

  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y })
  await cdp().send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 })
}

const release = async () => {
  const box = itemOf().getBoundingClientRect()

  await cdp().send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: box.left + box.width / 2, y: box.top + box.height / 2, button: 'left', clickCount: 1 })
}

const scaleOf = (element: HTMLElement) => {
  const transform = getComputedStyle(element).transform

  return transform === 'none' ? 1 : Number(transform.slice(7, -1).split(',')[0])
}

describe('Sidebar item motion in a real browser', () => {
  it('fades the item background and color in about 150 ms', async () => {
    renderInBrowser(<Page />, 'auto')
    const style = getComputedStyle(itemOf())

    expect(style.transitionProperty).toContain('background-color')
    expect(style.transitionDuration.split(',').map((value) => Math.round(parseFloat(value) * 1000))).toEqual([150, 150, 150])
  })

  it('presses the item down to a scale of 0.98 and back', async () => {
    renderInBrowser(<Page />, 'auto')

    await press()
    await expect.poll(() => Number(scaleOf(itemOf()).toFixed(2))).toBe(0.98)

    await release()
    await expect.poll(() => Number(scaleOf(itemOf()).toFixed(2))).toBe(1)
  })

  it('does not scale the item when the motion mode is never', async () => {
    renderInBrowser(<Page />, 'never')

    await press()
    await new Promise((resolve) => setTimeout(resolve, 80))

    expect(scaleOf(itemOf())).toBe(1)
    await release()
  })

  it('does not scale the item under reduced motion', async () => {
    await setReducedMotion('reduce')
    renderInBrowser(<Page />, 'auto')

    await press()
    await new Promise((resolve) => setTimeout(resolve, 200))

    expect(scaleOf(itemOf())).toBe(1)
    await release()
  })

  it('lets the caller change the item duration through its css variable', async () => {
    const style = document.createElement('style')
    style.textContent = '[data-slot="sidebar"] { --enchase-sidebar-item-duration: 320ms !important; }'
    document.head.append(style)
    renderInBrowser(<Page />, 'auto')

    expect(getComputedStyle(itemOf()).transitionDuration.split(',')[0]).toBe('0.32s')
    style.remove()
  })
})
