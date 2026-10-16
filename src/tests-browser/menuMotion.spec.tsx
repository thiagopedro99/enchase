import { useState } from 'react'
import { chromiumOnly } from './browserSkips.ts'
import { afterEach, describe, expect, it } from 'vitest'
import { cdp, page, userEvent } from 'vitest/browser'

import { Sidebar } from '@components/common/Sidebar/index.tsx'
import Layout from '@components/layout/index.tsx'
import Navbar from '@components/navbar/index.tsx'
import { demoSections } from '@tests/shared/fixtures/layoutBranding.tsx'
import { renderInBrowser } from './harness.tsx'
import { setReducedMotion } from './media.ts'
import { frames } from './settle.ts'


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
  it('runs a real inline-size transition instead of snapping', async () => {
    renderInBrowser(<Page />, 'auto')
    expect(Math.round(asideOf().getBoundingClientRect().width)).toBe(280)

    await userEvent.click(collapse())
    const transition = asideOf()
      .getAnimations()
      .find((animation) => ['inline-size', 'width'].includes((animation as CSSTransition).transitionProperty))

    expect(transition).toBeTruthy()
    expect(Math.round(Number(transition?.effect?.getComputedTiming().duration))).toBe(250)
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
    const seen: string[] = []
    const observer = new MutationObserver(() => seen.push(asideOf().getAttribute('data-state') as string))
    observer.observe(asideOf(), { attributes: true, attributeFilter: ['data-state'] })

    await userEvent.click(collapse())
    await expect.poll(() => asideOf().getAttribute('data-state')).toBe('collapsed')
    await userEvent.click(expand())
    await expect.poll(() => asideOf().getAttribute('data-state')).toBe('expanded')
    observer.disconnect()

    expect(seen).toEqual(['collapsing', 'collapsed', 'expanding', 'expanded'])
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

    const startOpacities: number[] = []
    const watcher = new MutationObserver(() => {
      if (asideOf().getAttribute('data-state') === 'expanding') startOpacities.push(Number(getComputedStyle(labelOf() as HTMLElement).opacity))
    })
    watcher.observe(asideOf(), { attributes: true, attributeFilter: ['data-state'] })

    await userEvent.click(expand())
    await expect.poll(() => asideOf().getAttribute('data-state')).toBe('expanded')
    watcher.disconnect()

    expect(startOpacities.length).toBeGreaterThan(0)
    expect(startOpacities[0]).toBeLessThan(0.05)
    await expect.poll(() => Number(getComputedStyle(labelOf() as HTMLElement).opacity)).toBeGreaterThan(0.95)
  })

  it('keeps the icons in place while the width changes', async () => {
    renderInBrowser(<Page />, 'auto')
    const icon = () => (document.querySelector('[data-slot="sidebar-item-icon"]') as HTMLElement).getBoundingClientRect()
    const start = icon().left

    await userEvent.click(collapse())
    const lefts: number[] = []

    for (let index = 0; index < 200 && asideOf().getAttribute('data-state') === 'collapsing'; index += 1) {
      lefts.push(icon().left)
      await frames(1)
    }

    expect(lefts.length).toBeGreaterThan(2)
    expect(lefts.every((left) => Math.abs(left - start) < 1)).toBe(true)
  })

  it('retargets when toggled in the middle and ends expanded', async () => {
    renderInBrowser(<Page />, 'auto')
    await userEvent.click(collapse())
    await expect.poll(() => asideOf().getAttribute('data-state')).toBe('collapsing')
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
    const durations = asideOf().getAnimations().map((animation) => Number(animation.effect?.getTiming().duration ?? 0))

    await expect.poll(() => asideOf().getAttribute('data-state'), { timeout: 1000 }).toBe('collapsed')
    expect(Math.max(...durations)).toBeLessThanOrEqual(100)
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

  chromiumOnly('rawMouseInput')('presses the item down to a scale of 0.98 and back', async () => {
    renderInBrowser(<Page />, 'auto')

    await press()
    await expect.poll(() => Number(scaleOf(itemOf()).toFixed(2))).toBe(0.98)

    await release()
    await expect.poll(() => Number(scaleOf(itemOf()).toFixed(2))).toBe(1)
  })

  chromiumOnly('rawMouseInput')('does not scale the item when the motion mode is never', async () => {
    renderInBrowser(<Page />, 'never')

    await press()
    await frames(4)

    expect(scaleOf(itemOf())).toBe(1)
    await release()
  })

  chromiumOnly('rawMouseInput')('does not scale the item under reduced motion', async () => {
    await setReducedMotion('reduce')
    renderInBrowser(<Page />, 'auto')

    await press()
    await frames(4)

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

const routes = [
  {
    id: 'main',
    title: 'Principal',
    items: [
      { id: 'a', label: 'Primeiro', href: '/a' },
      { id: 'b', label: 'Segundo', href: '/b' },
      { id: 'c', label: 'Terceiro', href: '/c' }
    ]
  }
]

const RoutePage = ({ start = '/a' }: { start?: string }) => {
  const [href, setHref] = useState(start)

  return (
    <>
      <button onClick={() => setHref('/c')}>Ir ao terceiro</button>
      <button onClick={() => setHref('/zzz')}>Ir a nenhum</button>
      <Sidebar sections={routes} currentHref={href} collapsed={false} onToggleCollapsed={() => undefined} />
    </>
  )
}

const indicatorOf = () => document.querySelector('[data-slot="sidebar-indicator"]') as HTMLElement

const itemByName = (name: string) => [...document.querySelectorAll('[data-slot="sidebar-item"] a')].find((element) => element.textContent?.includes(name)) as HTMLElement

const indicatorTop = () => indicatorOf().getBoundingClientRect().top

describe('Sidebar active indicator in a real browser', () => {
  it('sits on the current item with its size, without animating on the first paint', async () => {
    renderInBrowser(<RoutePage />, 'auto')
    const item = itemByName('Primeiro').getBoundingClientRect()
    const pill = indicatorOf().getBoundingClientRect()

    expect(indicatorOf()).toHaveAttribute('data-visible')
    expect(indicatorOf()).not.toHaveAttribute('data-animate')
    expect(Math.abs(pill.top - item.top)).toBeLessThan(1)
    expect(Math.round(pill.height)).toBe(Math.round(item.height))
    expect(Math.abs(pill.left - item.left)).toBeLessThan(1)
    expect(Math.abs(pill.width - item.width)).toBeLessThan(1)
  })

  it('takes over the current item background so the pill is the only highlight', async () => {
    renderInBrowser(<RoutePage />, 'auto')

    await expect.poll(() => getComputedStyle(itemByName('Primeiro')).backgroundColor).toBe('rgba(0, 0, 0, 0)')
    expect(getComputedStyle(indicatorOf()).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  it('slides through intermediate positions to the new current item', async () => {
    renderInBrowser(<RoutePage />, 'auto')
    const start = indicatorTop()

    await userEvent.click(page.getByRole('button', { name: 'Ir ao terceiro' }))
    const tops = await sample(indicatorTop, 24)
    const target = itemByName('Terceiro').getBoundingClientRect().top

    expect(tops.some((top) => top > start + 5 && top < target - 5)).toBe(true)
    await expect.poll(() => Math.abs(indicatorTop() - target)).toBeLessThan(1)
    expect(indicatorOf()).toHaveAttribute('data-animate')
  })

  it('hides the pill and gives the background back when no item is current', async () => {
    renderInBrowser(<RoutePage />, 'auto')

    await userEvent.click(page.getByRole('button', { name: 'Ir a nenhum' }))

    await expect.poll(() => indicatorOf().hasAttribute('data-visible')).toBe(false)
    expect(getComputedStyle(indicatorOf()).opacity).toBe('0')
  })

  it('jumps at once when the motion mode is never', async () => {
    renderInBrowser(<RoutePage />, 'never')

    await userEvent.click(page.getByRole('button', { name: 'Ir ao terceiro' }))
    const target = itemByName('Terceiro').getBoundingClientRect().top
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))

    expect(Math.abs(indicatorTop() - target)).toBeLessThan(1)
  })

  it('follows the item when the sidebar collapses and the section titles go away', async () => {
    const Collapsible = () => {
      const [collapsed, setCollapsed] = useState(false)

      return <Sidebar sections={routes} currentHref="/b" collapsed={collapsed} onToggleCollapsed={() => setCollapsed((value) => !value)} />
    }
    renderInBrowser(<Collapsible />, 'auto')

    await userEvent.click(page.getByRole('button', { name: 'Recolher menu lateral' }))
    await expect.poll(() => document.querySelector('[data-slot="sidebar"]')?.getAttribute('data-state')).toBe('collapsed')

    const item = document.querySelector('[data-slot="sidebar-item-control"], [data-slot="sidebar-item"] a') as HTMLElement
    const current = document.querySelector('[aria-current]') as HTMLElement
    await expect.poll(() => Math.abs(indicatorTop() - current.getBoundingClientRect().top)).toBeLessThan(1)
    expect(item).toBeTruthy()
  })

  it('lets the caller change the slide duration through its css variable', async () => {
    const style = document.createElement('style')
    style.textContent = '[data-slot="sidebar"] { --enchase-sidebar-indicator-duration: 480ms !important; }'
    document.head.append(style)
    renderInBrowser(<RoutePage />, 'auto')

    await userEvent.click(page.getByRole('button', { name: 'Ir ao terceiro' }))

    expect(getComputedStyle(indicatorOf()).transitionDuration.split(',')[0]).toBe('0.48s')
    style.remove()
  })
})

const DrawerPage = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <Sidebar variant="modal" open={open} onClose={() => setOpen(false)} sections={routes} />
    </>
  )
}

const toMilliseconds = (value: string) => (value.endsWith('ms') ? parseFloat(value) : parseFloat(value) * 1000)

const opacityDelays = (elements: HTMLElement[]) =>
  elements.map((element) => {
    const style = getComputedStyle(element)
    const properties = style.transitionProperty.split(',').map((property) => property.trim())
    const index = properties.indexOf('opacity')
    if (index === -1) return undefined

    const delays = style.transitionDelay.split(',').map((delay) => delay.trim())

    return Math.round(toMilliseconds(delays[index % delays.length]))
  })

const drawerItems = () => [...document.querySelectorAll('[data-slot="sidebar"][data-variant="modal"] [data-slot="sidebar-item"]')] as HTMLElement[]

const cascadeSnapshot = (elements: HTMLElement[]) => ({
  state: elements[0]?.closest('[role="dialog"]')?.getAttribute('data-state'),
  visibility: document.visibilityState,
  delays: opacityDelays(elements),
  properties: elements.map((element) => getComputedStyle(element).transitionProperty),
  durations: elements.map((element) => getComputedStyle(element).transitionDuration),
  rawDelays: elements.map((element) => getComputedStyle(element).transitionDelay)
})

const navbarLinks = () => [...document.querySelectorAll('[data-slot="navbar-drawer-nav"] a')] as HTMLElement[]

afterEach(async () => {
  await page.viewport(1280, 800)
})

describe('Drawer cascade in a real browser', () => {
  it('brings the sidebar drawer items in one after the other, 30 ms apart', async () => {
    renderInBrowser(<DrawerPage />, 'auto')

    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(() => cascadeSnapshot(drawerItems()), { timeout: 5000 }).toEqual(expect.objectContaining({ state: 'open', delays: [0, 30, 60] }))
  })

  it('starts the items hidden and ends with all of them fully visible', async () => {
    renderInBrowser(<DrawerPage />, 'auto')

    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(() => Number(getComputedStyle(drawerItems()[2]).opacity)).toBeLessThan(0.5)
    await expect.poll(() => drawerItems().every((item) => Number(getComputedStyle(item).opacity) > 0.99)).toBe(true)
  })

  it('does not run the cascade again when closing or when focus moves between items', async () => {
    renderInBrowser(<DrawerPage />, 'auto')
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(() => page.getByRole('dialog').element().getAttribute('data-state')).toBe('open')
    await expect.poll(() => drawerItems().every((item) => item.getAnimations().length === 0)).toBe(true)

    await userEvent.tab()
    await userEvent.tab()
    expect(drawerItems().every((item) => item.getAnimations().length === 0)).toBe(true)

    await userEvent.keyboard('{Escape}')
    expect(drawerItems().every((item) => item.getAnimations().length === 0)).toBe(true)
  })

  it('shows every item at once without delays when the motion mode is never', async () => {
    renderInBrowser(<DrawerPage />, 'never')

    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))

    await expect.poll(() => drawerItems().every((item) => Number(getComputedStyle(item).opacity) === 1)).toBe(true)
    expect(opacityDelays(drawerItems()).every((delay) => delay === undefined || delay === 0)).toBe(true)
  })

  it('has no cascade under reduced motion', async () => {
    await setReducedMotion('reduce')
    renderInBrowser(<DrawerPage />, 'auto')

    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))

    await expect.poll(() => drawerItems().length).toBe(3)
    expect(drawerItems().every((item) => Number(getComputedStyle(item).opacity) === 1)).toBe(true)
    expect(drawerItems().every((item) => getComputedStyle(item).translate === 'none')).toBe(true)
  })

  it('slides the navbar drawer links in with the same 30 ms cascade', async () => {
    await page.viewport(600, 800)
    renderInBrowser(<Navbar sections={routes} />, 'auto')

    await userEvent.click(page.getByRole('button', { name: 'Abrir menu' }))
    await expect.poll(() => opacityDelays(navbarLinks())).toEqual([0, 30, 60])
  })

  it('lets the caller change the cascade gap through its css variable', async () => {
    const style = document.createElement('style')
    style.textContent = '[data-slot="sidebar"][data-variant="modal"] { --enchase-sidebar-stagger: 90ms !important; }'
    document.head.append(style)
    renderInBrowser(<DrawerPage />, 'auto')

    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(() => opacityDelays(drawerItems())).toEqual([0, 90, 180])
    style.remove()
  })
})

const inactiveIcon = (slotName: string) => document.querySelector(`[data-slot="${slotName}"] [data-slot="icon-swap-item"][data-state="inactive"]`) as HTMLElement

const rotationOf = (element: HTMLElement) => {
  const transform = getComputedStyle(element).transform
  if (transform === 'none') return 0
  const [a, b] = transform.slice(7, -1).split(',').map(Number)

  return Math.round((Math.atan2(b, a) * 180) / Math.PI)
}

describe('Menu button icon in a real browser', () => {
  it('twists the inactive icon by 30 degrees and swaps in 150 ms', async () => {
    renderInBrowser(<Page />, 'auto')
    const icon = inactiveIcon('menu-toggle-icon')

    expect(rotationOf(icon)).toBe(-30)
    expect(getComputedStyle(icon).transitionDuration.split(',').every((value) => Math.round(parseFloat(value) * 1000) === 150)).toBe(true)
  })

  it('turns the other way in right-to-left', async () => {
    document.documentElement.dir = 'rtl'
    renderInBrowser(<Page />, 'auto')

    expect(rotationOf(inactiveIcon('menu-toggle-icon'))).toBe(30)
    document.documentElement.removeAttribute('dir')
  })

  it('does not rotate under reduced motion', async () => {
    await setReducedMotion('reduce')
    renderInBrowser(<Page />, 'auto')

    expect(rotationOf(inactiveIcon('menu-toggle-icon'))).toBe(0)
  })

  it('leaves the theme toggle icons without rotation', async () => {
    renderInBrowser(<Page />, 'auto')

    expect(rotationOf(inactiveIcon('theme-toggle') ?? inactiveIcon('icon-swap'))).toBe(0)
  })
})

describe('Sidebar animation prop in a real browser', () => {
  const Silent = () => {
    const [collapsed, setCollapsed] = useState(false)

    return <Sidebar sections={routes} currentHref="/b" animation={false} collapsed={collapsed} onToggleCollapsed={() => setCollapsed((value) => !value)} />
  }

  it('collapses at once, with no fade, no slide and no press scale, when animation is false', async () => {
    renderInBrowser(<Silent />, 'auto')

    await userEvent.click(page.getByRole('button', { name: 'Recolher menu lateral' }))

    await expect.poll(() => document.querySelector('[data-slot="sidebar"]')?.getAttribute('data-state'), { timeout: 2000 }).toBe('collapsed')
    expect(Math.round((document.querySelector('[data-slot="sidebar"]') as HTMLElement).getBoundingClientRect().width)).toBe(80)
    expect(getComputedStyle(document.querySelector('[data-slot="sidebar"]') as HTMLElement).getPropertyValue('--enchase-sidebar-item-scale').trim()).toBe('1')
  })
})
