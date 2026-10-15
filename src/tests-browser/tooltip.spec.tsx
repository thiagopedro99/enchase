import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cdp, page, userEvent } from 'vitest/browser'

import { Tooltip } from '@components/common/Tooltip/index.tsx'
import { resetTooltipGroup } from '@components/common/Tooltip/defaultData.ts'
import UIProvider from '@components/uiProvider/index.tsx'
import { ptBR } from '@locales/ptBR.ts'
import { renderInBrowser } from './harness.tsx'

const bubble = () => document.body.querySelector<HTMLElement>('[data-slot="tooltip-bubble"]')

const setReducedMotion = (value: 'reduce' | 'no-preference') => cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value }] })

beforeEach(resetTooltipGroup)

afterEach(() => setReducedMotion('no-preference'))

describe('Tooltip layer in a real browser', () => {
  it('renders the bubble on the body, fixed, outside a clipping container', async () => {
    renderInBrowser(
      <div data-testid="clip" style={{ overflow: 'hidden', width: 80, height: 30, margin: '120px auto' }}>
        <Tooltip text="Dica">
          <button>Alvo</button>
        </Tooltip>
      </div>
    )
    await userEvent.hover(page.getByRole('button', { name: 'Alvo' }))
    await expect.poll(bubble).toBeTruthy()

    expect(bubble()?.parentElement).toBe(document.body)
    expect(getComputedStyle(bubble() as HTMLElement).position).toBe('fixed')
    expect(page.getByTestId('clip').element().contains(bubble())).toBe(false)
  })

  it('stays above the trigger and clear of it', async () => {
    renderInBrowser(
      <div style={{ margin: '200px auto', width: 100 }}>
        <Tooltip text="Dica" position="top">
          <button>Alvo</button>
        </Tooltip>
      </div>
    )
    await userEvent.hover(page.getByRole('button', { name: 'Alvo' }))
    await expect.poll(bubble).toBeTruthy()

    const trigger = page.getByRole('button', { name: 'Alvo' }).element().getBoundingClientRect()
    const box = (bubble() as HTMLElement).getBoundingClientRect()

    expect(bubble()).toHaveAttribute('data-position', 'top')
    expect(box.bottom).toBeLessThanOrEqual(trigger.top)
  })
})

describe('Tooltip flipping and shifting in a real browser', () => {
  it('flips below the trigger when there is no room above', async () => {
    renderInBrowser(
      <div style={{ position: 'absolute', top: 0, left: 300 }}>
        <Tooltip text="Dica" position="top">
          <button>Alvo</button>
        </Tooltip>
      </div>
    )
    await userEvent.hover(page.getByRole('button', { name: 'Alvo' }))
    await expect.poll(bubble).toBeTruthy()

    const trigger = page.getByRole('button', { name: 'Alvo' }).element().getBoundingClientRect()
    const box = (bubble() as HTMLElement).getBoundingClientRect()

    expect(bubble()).toHaveAttribute('data-position', 'bottom')
    expect(box.top).toBeGreaterThanOrEqual(trigger.bottom)
  })

  it('flips above the trigger when there is no room below', async () => {
    await page.viewport(1280, 400)
    renderInBrowser(
      <div style={{ position: 'absolute', bottom: 0, left: 300 }}>
        <Tooltip text="Dica" position="bottom">
          <button>Alvo</button>
        </Tooltip>
      </div>
    )
    await userEvent.hover(page.getByRole('button', { name: 'Alvo' }))
    await expect.poll(bubble).toBeTruthy()

    expect(bubble()).toHaveAttribute('data-position', 'top')
    expect((bubble() as HTMLElement).getBoundingClientRect().top).toBeGreaterThanOrEqual(0)
  })

  it('keeps a bubble wider than its distance to the edge inside the viewport', async () => {
    renderInBrowser(
      <div style={{ position: 'absolute', top: 200, left: 0 }}>
        <Tooltip text="Uma dica bem longa para esta borda" position="top">
          <button>A</button>
        </Tooltip>
      </div>
    )
    await userEvent.hover(page.getByRole('button', { name: 'A' }))
    await expect.poll(bubble).toBeTruthy()

    await expect.poll(() => (bubble() as HTMLElement).getBoundingClientRect().left).toBeGreaterThanOrEqual(7.5)
  })
})

describe('Tooltip at the right edge in a real browser', () => {
  const bubbleRight = () => (bubble() as HTMLElement).getBoundingClientRect().right
  const visibleWidth = () => document.documentElement.clientWidth

  it('keeps a long bubble inside the viewport when the trigger touches the right edge', async () => {
    renderInBrowser(
      <div style={{ position: 'absolute', top: 10, right: 0 }}>
        <Tooltip text="Mudar para tema escuro" position="bottom">
          <button>T</button>
        </Tooltip>
      </div>
    )
    await userEvent.hover(page.getByRole('button', { name: 'T' }))
    await expect.poll(bubble).toBeTruthy()

    await expect.poll(bubbleRight).toBeLessThanOrEqual(visibleWidth() - 7.5)
  })

  it('keeps it inside the visible area when the page has a scrollbar', async () => {
    renderInBrowser(
      <div style={{ height: 3000 }}>
        <div style={{ position: 'absolute', top: 10, right: 0 }}>
          <Tooltip text="Mudar para tema escuro" position="top">
            <button>T</button>
          </Tooltip>
        </div>
      </div>
    )
    await userEvent.hover(page.getByRole('button', { name: 'T' }))
    await expect.poll(bubble).toBeTruthy()

    await expect.poll(bubbleRight).toBeLessThanOrEqual(visibleWidth() - 7.5)
  })

  it('fits again when the text grows while the bubble is open', async () => {
    const Toggle = () => {
      const [dark, setDark] = useState(false)

      return (
        <div style={{ position: 'absolute', top: 10, right: 0 }}>
          <Tooltip text={dark ? 'Mudar para tema claro muito longo' : 'Tema'} position="bottom">
            <button onClick={() => setDark(true)}>T</button>
          </Tooltip>
        </div>
      )
    }
    renderInBrowser(<Toggle />)
    await userEvent.hover(page.getByRole('button', { name: 'T' }))
    await expect.poll(bubble).toBeTruthy()
    await userEvent.click(page.getByRole('button', { name: 'T' }))

    await expect.poll(() => (bubble() as HTMLElement).textContent).toContain('muito longo')
    await expect.poll(bubbleRight).toBeLessThanOrEqual(visibleWidth() - 7.5)
  })

  it('measures the final bubble, not the one that is still scaling in', async () => {
    renderInBrowser(
      <div style={{ position: 'absolute', top: 10, right: 0 }}>
        <Tooltip text="Mudar para tema escuro" position="bottom" animation={{ recipe: 'pop' }}>
          <button>T</button>
        </Tooltip>
      </div>
    )
    await userEvent.hover(page.getByRole('button', { name: 'T' }))
    await expect.poll(bubble).toBeTruthy()
    await new Promise((resolve) => setTimeout(resolve, 400))

    expect(bubbleRight()).toBeLessThanOrEqual(visibleWidth() - 7.5)
  })
})

describe('Tooltip in right-to-left in a real browser', () => {
  const rtl = (position: 'start' | 'end') => (
    <div dir="rtl" style={{ margin: '200px auto', width: 100 }}>
      <UIProvider locale={{ ...ptBR, dir: 'rtl' }}>
        <Tooltip text="Dica" position={position}>
          <button>Alvo</button>
        </Tooltip>
      </UIProvider>
    </div>
  )

  it('puts the start side on the right of the trigger', async () => {
    renderInBrowser(rtl('start'))
    await userEvent.hover(page.getByRole('button', { name: 'Alvo' }))
    await expect.poll(bubble).toBeTruthy()

    const trigger = page.getByRole('button', { name: 'Alvo' }).element().getBoundingClientRect()

    expect(bubble()).toHaveAttribute('data-position', 'right')
    expect((bubble() as HTMLElement).getBoundingClientRect().left).toBeGreaterThanOrEqual(trigger.right)
  })

  it('puts the end side on the left of the trigger', async () => {
    renderInBrowser(rtl('end'))
    await userEvent.hover(page.getByRole('button', { name: 'Alvo' }))
    await expect.poll(bubble).toBeTruthy()

    const trigger = page.getByRole('button', { name: 'Alvo' }).element().getBoundingClientRect()

    expect(bubble()).toHaveAttribute('data-position', 'left')
    expect((bubble() as HTMLElement).getBoundingClientRect().right).toBeLessThanOrEqual(trigger.left)
  })
})

describe('Tooltip motion in a real browser', () => {
  const hoverAndRead = async () => {
    await userEvent.hover(page.getByRole('button', { name: 'Alvo' }))
    await expect.poll(bubble).toBeTruthy()

    return getComputedStyle(bubble() as HTMLElement)
  }

  it('fades with the motion token and settles at full opacity', async () => {
    renderInBrowser(
      <div style={{ margin: '200px auto', width: 100 }}>
        <Tooltip text="Dica">
          <button>Alvo</button>
        </Tooltip>
      </div>,
      'auto'
    )
    const style = await hoverAndRead()

    expect(style.transitionProperty).toContain('opacity')
    expect(parseFloat(style.transitionDuration)).toBeGreaterThan(0.1)
    await expect.poll(() => getComputedStyle(bubble() as HTMLElement).opacity).toBe('1')
  })

  it('enters with the snappy spring easing only for the pop recipe', async () => {
    renderInBrowser(
      <div style={{ margin: '200px auto', width: 100 }}>
        <Tooltip text="Dica" animation={{ recipe: 'pop' }}>
          <button>Alvo</button>
        </Tooltip>
      </div>,
      'auto'
    )
    const pop = await hoverAndRead()

    expect(pop.transitionTimingFunction.startsWith('linear(')).toBe(true)
  })

  it('keeps the plain ease-out curve for the default fade', async () => {
    renderInBrowser(
      <div style={{ margin: '200px auto', width: 100 }}>
        <Tooltip text="Dica">
          <button>Alvo</button>
        </Tooltip>
      </div>,
      'auto'
    )
    const fade = await hoverAndRead()

    expect(fade.transitionTimingFunction.startsWith('linear(')).toBe(false)
  })

  it('keeps only the opacity transition when the user asks for reduced motion', async () => {
    await setReducedMotion('reduce')
    renderInBrowser(
      <div style={{ margin: '200px auto', width: 100 }}>
        <Tooltip text="Dica">
          <button>Alvo</button>
        </Tooltip>
      </div>,
      'auto'
    )
    const style = await hoverAndRead()

    expect(style.transitionProperty).toBe('opacity')
    expect(parseFloat(style.transitionDuration)).toBeGreaterThan(0.01)
  })

  it('removes the bubble from the page after the exit transition', async () => {
    renderInBrowser(
      <div style={{ margin: '200px auto', width: 100 }}>
        <Tooltip text="Dica" closeDelay={0}>
          <button>Alvo</button>
        </Tooltip>
      </div>,
      'auto'
    )
    await hoverAndRead()
    await userEvent.unhover(page.getByRole('button', { name: 'Alvo' }))

    await expect.poll(bubble, { timeout: 2000 }).toBeNull()
  })
})
