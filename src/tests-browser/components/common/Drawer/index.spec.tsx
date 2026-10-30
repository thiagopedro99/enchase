import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'
import { render } from '@testing-library/react'
import { useState } from 'react'

import { onRoot, part, parts, style } from '../../../support/hookProbes.ts'
import { pressMouse, releaseMouse } from '../../../support/pointer.ts'
import { ColorModeProvider } from '@components/colorMode/index.tsx'
import { frames, waitForSettled } from '../../../support/settle.ts'
import { accessibilityViolations } from '../../../support/axe.ts'
import { renderInBrowser } from '../../../support/harness.tsx'
import { Drawer } from '@components/common/Drawer/index.tsx'
import { Button } from '@components/common/Button/index.tsx'
import { setReducedMotion } from '../../../support/media.ts'
import UIProvider from '@components/uiProvider/index.tsx'
import { GlobalStyles } from '@styles/react.tsx'
import { ptBR } from '@locales/ptBR.ts'

import type { DrawerProps } from '@components/common/Drawer/types.ts'
import type { ReactElement } from 'react'

const renderRtl = (ui: ReactElement, motion: 'auto' | 'never' = 'never') =>
  render(
    <ColorModeProvider defaultMode="light" storage={null}>
      <GlobalStyles />
      <UIProvider locale={{ ...ptBR, dir: 'rtl' }} motion={{ mode: motion }} navigate={() => undefined} currentHref="/">
        {ui}
      </UIProvider>
    </ColorModeProvider>
  )

const DrawerPage = ({ children = <input aria-label="Nome" />, ...props }: Partial<DrawerProps>) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      <main>
        <button>Atrás</button>
        <div style={{ height: 3000 }}>Conteúdo longo</div>
      </main>
      <Drawer title="Filtros" {...props} open={open} onClose={() => setOpen(false)}>
        {children}
      </Drawer>
    </>
  )
}

const panel = () => part('drawer-panel') as HTMLElement

const openIt = async () => {
  await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
  await expect.poll(() => panel()?.getAttribute('data-state')).toBe('open')
  await waitForSettled(panel)
}

const offsetWhile = (state: 'entering' | 'exiting') => {
  const element = panel()
  const current = element.getAttribute('data-state') ?? 'open'

  element.style.transition = 'none'
  element.setAttribute('data-state', state)

  const offset = new DOMMatrix(getComputedStyle(element).transform).m41

  element.setAttribute('data-state', current)
  element.style.transition = ''

  return offset
}

const colorOf = (value: string) => value.replace(/\s+/g, '')

const travelOf = (read: () => Element | undefined) => {
  const samples: number[] = []
  let running = true

  const sample = () => {
    const element = read()

    if (element) samples.push(new DOMMatrix(getComputedStyle(element).transform).m41)
    if (running) requestAnimationFrame(sample)
  }

  requestAnimationFrame(sample)

  return {
    samples,
    stop: () => {
      running = false
    }
  }
}

afterEach(async () => {
  await releaseMouse()
  document.documentElement.removeAttribute('style')
  await page.viewport(1280, 800)
})

describe('the Drawer in a real browser: where it lands', () => {
  it.each([
    ['start', 'ltr', 'left'],
    ['end', 'ltr', 'right'],
    ['start', 'rtl', 'right'],
    ['end', 'rtl', 'left']
  ] as const)('puts the %s side in %s on the %s edge and takes the whole height', async (side, direction, edge) => {
    const mount: (ui: ReactElement) => unknown = direction === 'rtl' ? renderRtl : renderInBrowser

    document.documentElement.dir = direction
    mount(<DrawerPage side={side} />)
    await openIt()

    const box = panel().getBoundingClientRect()
    const area = part('drawer-overlay').getBoundingClientRect()

    expect(Math.round(edge === 'left' ? box.left - area.left : area.right - box.right)).toBe(0)
    expect([Math.round(box.top - area.top), Math.round(box.height)]).toEqual([0, Math.round(area.height)])
  })

  it.each([
    ['sm', 320],
    ['md', 400],
    ['lg', 560]
  ] as const)('is %s wide at %ipx', async (size, width) => {
    renderInBrowser(<DrawerPage size={size} />)
    await openIt()

    expect(Math.round(panel().getBoundingClientRect().width)).toBe(width)
  })

  it('is as wide as md by default', async () => {
    renderInBrowser(<DrawerPage />)
    await openIt()

    expect(panel().getAttribute('data-size')).toBe('md')
    expect(Math.round(panel().getBoundingClientRect().width)).toBe(400)
  })

  it('never takes more than 90% of a narrow screen', async () => {
    await page.viewport(360, 700)
    renderInBrowser(<DrawerPage size="lg" />)
    await openIt()

    expect(Math.round(panel().getBoundingClientRect().width)).toBe(Math.round(window.innerWidth * 0.9))
  })

  it('sits above the page and below nothing but its own overlay', async () => {
    renderInBrowser(<DrawerPage />)
    await openIt()

    const box = panel().getBoundingClientRect()

    expect(panel().contains(document.elementFromPoint(box.left + box.width / 2, box.top + 120))).toBe(true)
    expect(document.elementFromPoint(box.right + 100, 300)).toBe(part('drawer-overlay'))
  })

  it('keeps the close button at the end of the header when there is no title', async () => {
    renderInBrowser(<DrawerPage title={undefined} ariaLabel="Menu" />)
    await openIt()

    const close = part('drawer-close').getBoundingClientRect()
    const box = panel().getBoundingClientRect()

    expect(close.left).toBeGreaterThan(box.left + box.width / 2)
    expect(close.width).toBeGreaterThanOrEqual(24)
    expect(close.height).toBeGreaterThanOrEqual(24)
  })

  it('keeps the close button at the end of the header in right-to-left', async () => {
    document.documentElement.dir = 'rtl'
    renderRtl(<DrawerPage title={undefined} ariaLabel="Menu" />)
    await openIt()

    const close = part('drawer-close').getBoundingClientRect()
    const box = panel().getBoundingClientRect()

    expect(close.right).toBeLessThan(box.left + box.width / 2)
  })

  it('puts the title before the close button', async () => {
    renderInBrowser(<DrawerPage />)
    await openIt()

    expect(part('drawer-title').getBoundingClientRect().left).toBeLessThan(part('drawer-close').getBoundingClientRect().left)
  })

  it('keeps the header and the footer in place and scrolls the body when the content is tall', async () => {
    renderInBrowser(
      <DrawerPage footer={<button>Salvar</button>}>
        <div style={{ height: 3000 }}>Muito conteúdo</div>
      </DrawerPage>
    )
    await openIt()

    const body = part('drawer-body') as HTMLElement
    const footer = part('drawer-footer').getBoundingClientRect()

    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)
    expect(Math.round(footer.bottom)).toBeLessThanOrEqual(window.innerHeight)

    body.scrollTop = 500

    expect(Math.round(part('drawer-footer').getBoundingClientRect().top)).toBe(Math.round(footer.top))
    expect(Math.round(part('drawer-header').getBoundingClientRect().top)).toBe(0)
  })
})

describe('the Drawer in a real browser: how it slides', () => {
  it.each([
    ['start', 'ltr', -1],
    ['end', 'ltr', 1],
    ['start', 'rtl', 1],
    ['end', 'rtl', -1]
  ] as const)('waits off the page by its own width on the %s side in %s while it enters and leaves', async (side, direction, sign) => {
    const mount: (ui: ReactElement, motion?: 'auto' | 'never') => unknown = direction === 'rtl' ? renderRtl : renderInBrowser

    document.documentElement.dir = direction
    mount(<DrawerPage side={side} size="sm" />, 'never')
    await openIt()

    expect(Math.round(offsetWhile('entering'))).toBe(sign * 320)
    expect(Math.round(offsetWhile('exiting'))).toBe(sign * 320)
  })

  it('travels the width of a wide panel and not a fixed distance', async () => {
    renderInBrowser(<DrawerPage size="lg" />)
    await openIt()

    expect(Math.round(offsetWhile('entering'))).toBe(-560)
  })

  it('travels farther when the distance of the motion is larger than the panel, and not less when it is shorter', async () => {
    renderInBrowser(<DrawerPage animation={{ tuning: { distance: 700 } }} />, 'auto')
    await openIt()

    expect(Math.round(offsetWhile('entering'))).toBe(-700)
  })

  it('does not travel at all when the user asks for reduced motion', async () => {
    renderInBrowser(<DrawerPage />, 'auto')
    await openIt()
    await setReducedMotion('reduce')

    expect(offsetWhile('entering')).toBe(0)
    expect(offsetWhile('exiting')).toBe(0)
  })

  it('slides in across its own width and slides out again', async () => {
    renderInBrowser(<DrawerPage />, 'auto')
    const entering = travelOf(() => part('drawer-panel'))

    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(() => panel()?.getAttribute('data-state')).toBe('open')
    await waitForSettled(panel)
    await frames(2)
    entering.stop()

    const width = Math.round(panel().getBoundingClientRect().width)

    expect(Math.round(entering.samples[0])).toBe(-width)
    expect(entering.samples.some((value) => value < -5 && value > 5 - width)).toBe(true)
    expect(entering.samples.every((value, index) => index === 0 || value >= entering.samples[index - 1] - 0.5)).toBe(true)
    expect(Math.round(entering.samples[entering.samples.length - 1])).toBe(0)

    const leaving = travelOf(() => part('drawer-panel'))

    await userEvent.keyboard('{Escape}')
    await expect.poll(() => parts('drawer-panel').length).toBe(0)
    leaving.stop()

    expect(Math.round(leaving.samples[0])).toBe(0)
    expect(Math.min(...leaving.samples)).toBeLessThanOrEqual(-width * 0.8)
    expect(leaving.samples.every((value, index) => index === 0 || value <= leaving.samples[index - 1] + 0.5)).toBe(true)
  })

  it('fades the overlay in with the same timing', async () => {
    renderInBrowser(<DrawerPage />, 'auto')
    await userEvent.click(page.getByRole('button', { name: 'Abrir' }))
    await expect.poll(() => part('drawer-overlay')?.getAttribute('data-state')).toBe('open')
    await waitForSettled(() => part('drawer-overlay'))

    expect(style('drawer-overlay').opacity).toBe('1')
    expect(parseFloat(style('drawer-overlay').transitionDuration)).toBeGreaterThan(0.01)
  })
})

describe('the Drawer in a real browser: how it behaves as a dialog', () => {
  const dialogOf = () => page.getByRole('dialog').element() as HTMLElement

  it('moves the focus into the drawer and keeps Tab and Shift+Tab inside it', async () => {
    renderInBrowser(<DrawerPage footer={<button>Salvar</button>} />)
    await openIt()

    expect(dialogOf().contains(document.activeElement)).toBe(true)

    for (let round = 0; round < 8; round += 1) {
      await userEvent.tab()
      expect(dialogOf().contains(document.activeElement)).toBe(true)
    }

    for (let round = 0; round < 8; round += 1) {
      await userEvent.tab({ shift: true })
      expect(dialogOf().contains(document.activeElement)).toBe(true)
    }
  })

  it('makes the page behind inert so it cannot be focused or hit', async () => {
    renderInBrowser(<DrawerPage />)
    await openIt()

    const behind = page.getByRole('button', { name: 'Atrás', includeHidden: true }).element() as HTMLButtonElement
    const box = behind.getBoundingClientRect()

    expect(behind.closest('[inert]')).not.toBeNull()
    expect(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)).not.toBe(behind)
    behind.focus()
    expect(document.activeElement).not.toBe(behind)
  })

  it('locks the page scroll while open and restores it on close', async () => {
    renderInBrowser(<DrawerPage />)
    const before = getComputedStyle(document.body).overflow

    await openIt()
    expect(getComputedStyle(document.body).overflow).toBe('hidden')

    await userEvent.keyboard('{Escape}')
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
    await expect.poll(() => getComputedStyle(document.body).overflow).toBe(before)
  })

  it('closes with Escape and gives the focus back to the trigger', async () => {
    renderInBrowser(<DrawerPage />)
    const trigger = page.getByRole('button', { name: 'Abrir' })

    await openIt()
    await userEvent.keyboard('{Escape}')
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
    await expect.poll(() => document.activeElement).toBe(trigger.element())
  })

  it('closes when the overlay is clicked and when the close button is pressed', async () => {
    renderInBrowser(<DrawerPage />)
    await openIt()

    await userEvent.click(page.elementLocator(part('drawer-overlay')))
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()

    await openIt()
    await userEvent.click(page.getByRole('button', { name: 'Fechar modal' }))
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
  })

  it('stays open when the overlay is clicked with closeOnOverlayClick off', async () => {
    renderInBrowser(<DrawerPage closeOnOverlayClick={false} />)
    await openIt()

    await userEvent.click(page.elementLocator(part('drawer-overlay')))
    await frames(4)

    expect(page.getByRole('dialog').elements()).toHaveLength(1)
  })
})

describe('the Drawer in a real browser: how its body scrolls with the keyboard', () => {
  const longContent = <div style={{ height: 3000 }}>Muito conteúdo</div>

  const save = <Button>Salvar</Button>

  const bodyOf = () => part('drawer-body') as HTMLElement

  const semanticsOf = (element: HTMLElement) => element.getAttributeNames().filter((name) => name === 'tabindex' || name === 'role' || name.startsWith('aria-'))

  const ringOf = (element: HTMLElement) => {
    const ring = getComputedStyle(element)

    return { width: ring.outlineWidth, style: ring.outlineStyle, offset: ring.outlineOffset, color: ring.outlineColor }
  }

  it('puts the scrolling body in the tab order, between the close button and the footer, and scrolls it with the keys', async () => {
    renderInBrowser(<DrawerPage footer={save}>{longContent}</DrawerPage>)
    await openIt()

    const body = bodyOf()

    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)
    await expect.poll(() => body.getAttribute('tabindex')).toBe('0')
    expect(page.getByRole('region', { name: 'Filtros' }).element()).toBe(body)
    expect(document.activeElement).toBe(part('drawer-close'))

    await userEvent.tab()
    expect(document.activeElement).toBe(body)

    await userEvent.keyboard('{PageDown}')
    await expect.poll(() => body.scrollTop).toBeGreaterThan(0)

    await userEvent.keyboard('{End}')
    await expect.poll(() => Math.round(body.scrollTop + body.clientHeight)).toBe(body.scrollHeight)

    await userEvent.keyboard('{Home}')
    await expect.poll(() => body.scrollTop).toBe(0)

    await userEvent.tab()
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Salvar' }).element())
    await userEvent.tab()
    expect(document.activeElement).toBe(part('drawer-close'))
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Salvar' }).element())
    await userEvent.tab({ shift: true })
    expect(document.activeElement).toBe(body)
  })

  it('names the scrolling body with the aria label when the drawer has no title', async () => {
    renderInBrowser(
      <DrawerPage title={undefined} ariaLabel="Menu">
        {longContent}
      </DrawerPage>
    )
    await openIt()

    await expect.poll(() => bodyOf().getAttribute('tabindex')).toBe('0')
    expect(page.getByRole('region', { name: 'Menu' }).element()).toBe(bodyOf())
  })

  it('draws the focus ring of the library inside the body', async () => {
    renderInBrowser(<DrawerPage>{longContent}</DrawerPage>)
    await openIt()
    await expect.poll(() => bodyOf().getAttribute('tabindex')).toBe('0')
    await userEvent.tab()

    expect(document.activeElement).toBe(bodyOf())
    expect(ringOf(bodyOf())).toEqual({ width: '2px', style: 'solid', offset: '-2px', color: 'rgb(79, 70, 229)' })
  })

  it('keeps a body that fits out of the tab order, without a role or a label', async () => {
    renderInBrowser(<DrawerPage footer={save}>Pouco conteúdo</DrawerPage>)
    await openIt()

    expect(bodyOf().scrollHeight).toBeLessThanOrEqual(bodyOf().clientHeight)
    expect(semanticsOf(bodyOf())).toEqual([])

    const stops: Array<string | null | undefined> = []

    for (let round = 0; round < 4; round += 1) {
      await userEvent.tab()
      stops.push(document.activeElement?.getAttribute('data-slot'))
    }

    expect(stops).toEqual(['button', 'drawer-close', 'button', 'drawer-close'])
  })

  it('becomes reachable when a short screen makes the body scroll, and leaves the tab order when the screen grows back', async () => {
    renderInBrowser(
      <DrawerPage footer={save}>
        <div style={{ height: 300 }}>Conteúdo médio</div>
      </DrawerPage>
    )
    await openIt()

    expect(semanticsOf(bodyOf())).toEqual([])

    await page.viewport(1280, 300)
    await expect.poll(() => bodyOf().getAttribute('tabindex')).toBe('0')
    expect(page.getByRole('region', { name: 'Filtros' }).element()).toBe(bodyOf())

    await page.viewport(1280, 800)
    await expect.poll(() => semanticsOf(bodyOf())).toEqual([])
  })

  it('closes with Escape while the body has the focus and gives the focus back to the trigger', async () => {
    renderInBrowser(<DrawerPage>{longContent}</DrawerPage>)
    const trigger = page.getByRole('button', { name: 'Abrir' })

    await openIt()
    await expect.poll(() => bodyOf().getAttribute('tabindex')).toBe('0')
    await userEvent.tab()
    expect(document.activeElement).toBe(bodyOf())

    await userEvent.keyboard('{Escape}')
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
    await expect.poll(() => document.activeElement).toBe(trigger.element())
  })

  it.each([
    ['light', 'scrolls', longContent],
    ['dark', 'scrolls', longContent],
    ['light', 'fits', 'Pouco conteúdo'],
    ['dark', 'fits', 'Pouco conteúdo']
  ] as const)('has no axe violation in the %s mode when the body %s', async (mode, state, content) => {
    renderInBrowser(<DrawerPage footer={save}>{content}</DrawerPage>, 'never', mode)
    await openIt()
    await expect.poll(() => bodyOf().hasAttribute('tabindex')).toBe(state === 'scrolls')

    expect(await accessibilityViolations(panel())).toEqual([])
  })
})

describe('the drawer from the hooks', () => {
  it('takes the colors, the shadow and the spacing of its parts from their hooks', async () => {
    onRoot({
      '--enchase-drawer-overlay-background': 'rgb(1, 2, 3)',
      '--enchase-drawer-panel-background': 'rgb(4, 5, 6)',
      '--enchase-drawer-panel-color': 'rgb(19, 20, 21)',
      '--enchase-drawer-panel-shadow': '0 0 0 3px rgb(7, 8, 9)',
      '--enchase-drawer-header-padding-inline': '9px',
      '--enchase-drawer-body-padding-inline': '11px',
      '--enchase-drawer-footer-padding-inline': '13px',
      '--enchase-drawer-title-color': 'rgb(10, 11, 12)',
      '--enchase-drawer-body-color': 'rgb(13, 14, 15)',
      '--enchase-drawer-close-color': 'rgb(16, 17, 18)'
    })
    renderInBrowser(<DrawerPage footer={<button>Salvar</button>}>Corpo</DrawerPage>)
    await openIt()

    expect(style('drawer-overlay').backgroundColor).toBe('rgb(1, 2, 3)')
    expect([style('drawer-panel').backgroundColor, style('drawer-panel').color, colorOf(style('drawer-panel').boxShadow)]).toEqual(['rgb(4, 5, 6)', 'rgb(19, 20, 21)', expect.stringContaining('rgb(7,8,9)')])
    expect([style('drawer-header').paddingLeft, style('drawer-body').paddingLeft, style('drawer-footer').paddingLeft]).toEqual(['9px', '11px', '13px'])
    expect([style('drawer-title').color, style('drawer-body').color, style('drawer-close').color]).toEqual(['rgb(10, 11, 12)', 'rgb(13, 14, 15)', 'rgb(16, 17, 18)'])
  })

  it('takes the block spacing of the header, the body and the footer from their hooks', async () => {
    onRoot({
      '--enchase-drawer-header-padding-block': '7px 8px',
      '--enchase-drawer-body-padding-block': '5px 6px',
      '--enchase-drawer-footer-padding-block': '17px',
      '--enchase-drawer-header-gap': '21px'
    })
    renderInBrowser(<DrawerPage footer={<button>Salvar</button>}>Corpo</DrawerPage>)
    await openIt()

    expect([style('drawer-header').paddingTop, style('drawer-header').paddingBottom, style('drawer-header').columnGap]).toEqual(['7px', '8px', '21px'])
    expect([style('drawer-body').paddingTop, style('drawer-body').paddingBottom]).toEqual(['5px', '6px'])
    expect([style('drawer-footer').paddingTop, style('drawer-footer').paddingBottom]).toEqual(['17px', '17px'])
  })

  it('takes the type of the title and of the body from their hooks', async () => {
    onRoot({
      '--enchase-drawer-title-font-size': '23px',
      '--enchase-drawer-title-font-weight': '650',
      '--enchase-drawer-body-font-size': '13px',
      '--enchase-drawer-body-line-height': '27px'
    })
    renderInBrowser(<DrawerPage>Corpo</DrawerPage>)
    await openIt()

    expect([style('drawer-title').fontSize, style('drawer-title').fontWeight, style('drawer-body').fontSize, style('drawer-body').lineHeight]).toEqual(['23px', '650', '13px', '27px'])
  })

  it.each([
    ['start', 'ltr', 'Right', 'Left'],
    ['end', 'ltr', 'Left', 'Right'],
    ['start', 'rtl', 'Left', 'Right'],
    ['end', 'rtl', 'Right', 'Left']
  ] as const)('puts the border of the %s side in %s on its inner edge only', async (side, direction, inner, outer) => {
    const mount: (ui: ReactElement) => unknown = direction === 'rtl' ? renderRtl : renderInBrowser

    onRoot({ '--enchase-drawer-panel-border-width': '3px', '--enchase-drawer-panel-border-color': 'rgb(1, 2, 3)' })
    document.documentElement.dir = direction
    mount(<DrawerPage side={side} />)
    await openIt()

    const panelStyle = style('drawer-panel')

    expect([panelStyle.getPropertyValue(`border-${inner.toLowerCase()}-width`), panelStyle.getPropertyValue(`border-${inner.toLowerCase()}-color`)]).toEqual(['3px', 'rgb(1, 2, 3)'])
    expect([panelStyle.getPropertyValue(`border-${outer.toLowerCase()}-width`), panelStyle.borderTopWidth, panelStyle.borderBottomWidth]).toEqual(['0px', '0px', '0px'])
  })

  it('takes the radius of the panel from its hook, on the inner edge only', async () => {
    onRoot({ '--enchase-drawer-panel-radius': '11px' })
    renderInBrowser(<DrawerPage />)
    await openIt()

    const panelStyle = style('drawer-panel')

    expect([panelStyle.borderTopRightRadius, panelStyle.borderBottomRightRadius, panelStyle.borderTopLeftRadius, panelStyle.borderBottomLeftRadius]).toEqual(['11px', '11px', '0px', '0px'])
  })

  it('rounds the other edge when the drawer comes from the end', async () => {
    onRoot({ '--enchase-drawer-panel-radius': '11px' })
    renderInBrowser(<DrawerPage side="end" />)
    await openIt()

    const panelStyle = style('drawer-panel')

    expect([panelStyle.borderTopLeftRadius, panelStyle.borderBottomLeftRadius, panelStyle.borderTopRightRadius, panelStyle.borderBottomRightRadius]).toEqual(['11px', '11px', '0px', '0px'])
  })

  it('takes the width of each size from its own hook', async () => {
    onRoot({ '--enchase-drawer-panel-width-sm': '311px', '--enchase-drawer-panel-width-md': '413px', '--enchase-drawer-panel-width-lg': '577px' })
    renderInBrowser(
      <>
        <Drawer open onClose={() => undefined} title="Small" size="sm">
          a
        </Drawer>
        <Drawer open onClose={() => undefined} title="Medium">
          b
        </Drawer>
        <Drawer open onClose={() => undefined} title="Large" size="lg">
          c
        </Drawer>
      </>
    )
    await expect.poll(() => parts('drawer-panel').length).toBe(3)

    expect(parts('drawer-panel').map((element) => getComputedStyle(element).width)).toEqual(['311px', '413px', '577px'])
  })

  it('takes the colors and the radius of the close button from their hooks, also on hover and while pressed', async () => {
    onRoot({
      '--enchase-drawer-close-color-hover': 'rgb(1, 2, 3)',
      '--enchase-drawer-close-color-active': 'rgb(4, 5, 6)',
      '--enchase-drawer-close-radius': '7px'
    })
    renderInBrowser(<DrawerPage />)
    await openIt()

    expect(style('drawer-close').borderTopLeftRadius).toBe('7px')

    await userEvent.hover(part('drawer-close'))
    await waitForSettled(() => part('drawer-close'))

    expect(style('drawer-close').color).toBe('rgb(1, 2, 3)')

    await pressMouse('[data-slot="drawer-close"]')
    await waitForSettled(() => part('drawer-close'))

    expect(style('drawer-close').color).toBe('rgb(4, 5, 6)')
  })

  it('keeps the header and the footer without a border when no hook is set', async () => {
    renderInBrowser(<DrawerPage footer={<button>Salvar</button>}>Corpo</DrawerPage>)
    await openIt()

    const sides = ['top', 'right', 'bottom', 'left']

    for (const name of ['drawer-header', 'drawer-footer']) {
      const computed = style(name)

      expect(sides.map((side) => [computed.getPropertyValue(`border-${side}-width`), computed.getPropertyValue(`border-${side}-style`), computed.getPropertyValue(`border-${side}-color`)])).toEqual(sides.map(() => ['0px', 'none', computed.color]))
    }
  })

  it.each(['ltr', 'rtl'] as const)('draws a border at the end of the header and at the start of the footer from their hooks in %s, and leaves the other sides alone', async (direction) => {
    const mount: (ui: ReactElement) => unknown = direction === 'rtl' ? renderRtl : renderInBrowser

    onRoot({
      '--enchase-drawer-header-border-width-end': '3px',
      '--enchase-drawer-header-border-style-end': 'solid',
      '--enchase-drawer-header-border-color-end': 'rgb(1, 2, 3)',
      '--enchase-drawer-footer-border-width-start': '5px',
      '--enchase-drawer-footer-border-style-start': 'dashed',
      '--enchase-drawer-footer-border-color-start': 'rgb(4, 5, 6)'
    })
    document.documentElement.dir = direction
    mount(<DrawerPage footer={<button>Salvar</button>}>Corpo</DrawerPage>)
    await openIt()

    const header = style('drawer-header')
    const footer = style('drawer-footer')

    expect([header.borderBottomWidth, header.borderBottomStyle, header.borderBottomColor]).toEqual(['3px', 'solid', 'rgb(1, 2, 3)'])
    expect([header.borderTopWidth, header.borderRightWidth, header.borderLeftWidth]).toEqual(['0px', '0px', '0px'])
    expect([footer.borderTopWidth, footer.borderTopStyle, footer.borderTopColor]).toEqual(['5px', 'dashed', 'rgb(4, 5, 6)'])
    expect([footer.borderBottomWidth, footer.borderRightWidth, footer.borderLeftWidth]).toEqual(['0px', '0px', '0px'])
  })

  it('draws nothing from the width and the color of the borders alone, until the style is set', async () => {
    onRoot({
      '--enchase-drawer-header-border-width-end': '3px',
      '--enchase-drawer-header-border-color-end': 'rgb(1, 2, 3)',
      '--enchase-drawer-footer-border-width-start': '5px',
      '--enchase-drawer-footer-border-color-start': 'rgb(4, 5, 6)'
    })
    renderInBrowser(<DrawerPage footer={<button>Salvar</button>}>Corpo</DrawerPage>)
    await openIt()

    expect([style('drawer-header').borderBottomStyle, style('drawer-header').borderBottomWidth, style('drawer-footer').borderTopStyle, style('drawer-footer').borderTopWidth]).toEqual(['none', '0px', 'none', '0px'])
  })

  it('keeps the width of the borders at zero when only the style is set', async () => {
    onRoot({ '--enchase-drawer-header-border-style-end': 'solid', '--enchase-drawer-footer-border-style-start': 'solid' })
    renderInBrowser(<DrawerPage footer={<button>Salvar</button>}>Corpo</DrawerPage>)
    await openIt()

    expect([style('drawer-header').borderBottomWidth, style('drawer-footer').borderTopWidth]).toEqual(['0px', '0px'])
  })

  it('draws the border of the header without drawing the one of the footer, and the other way round', async () => {
    onRoot({ '--enchase-drawer-header-border-width-end': '3px', '--enchase-drawer-header-border-style-end': 'solid' })
    renderInBrowser(<DrawerPage footer={<button>Salvar</button>}>Corpo</DrawerPage>)
    await openIt()

    expect([style('drawer-header').borderBottomWidth, style('drawer-footer').borderTopWidth]).toEqual(['3px', '0px'])

    document.documentElement.removeAttribute('style')
    onRoot({ '--enchase-drawer-footer-border-width-start': '5px', '--enchase-drawer-footer-border-style-start': 'solid' })

    expect([style('drawer-header').borderBottomWidth, style('drawer-footer').borderTopWidth]).toEqual(['0px', '5px'])
  })
})
