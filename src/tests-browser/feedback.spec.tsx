import { afterEach, describe, expect, it } from 'vitest'
import { cdp, page } from 'vitest/browser'

import { Card } from '@components/common/Card/index.tsx'
import { InlineLoading, Loading } from '@components/common/Loading/index.tsx'
import { Skeleton } from '@components/common/Skeleton/index.tsx'
import { renderInBrowser } from './harness.tsx'

const setReducedMotion = (value: 'reduce' | 'no-preference') => cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value }] })

const added: HTMLStyleElement[] = []

const addStyle = (css: string, where: 'start' | 'end') => {
  const style = document.createElement('style')
  style.textContent = css
  if (where === 'start') document.head.prepend(style)
  else document.head.append(style)
  added.push(style)
}

afterEach(async () => {
  added.splice(0).forEach((style) => style.remove())
  await setReducedMotion('no-preference')
})

const sampleTransforms = async (read: () => string) => {
  const first = read()
  await new Promise((resolve) => setTimeout(resolve, 120))

  return [first, read()]
}

describe('Skeleton in a real browser', () => {
  it('sweeps a pseudo-element with transform and never animates background-position', async () => {
    renderInBrowser(<Skeleton data-testid="skeleton" />, 'auto')
    const element = page.getByTestId('skeleton').element()
    const sweep = getComputedStyle(element, '::after')

    expect(sweep.animationName).not.toBe('none')
    expect(sweep.animationName).not.toContain('background')
    expect(sweep.animationDuration).toBe('1.5s')
    expect(sweep.animationIterationCount).toBe('infinite')
    expect(getComputedStyle(element).animationName).toBe('none')

    const [first, second] = await sampleTransforms(() => getComputedStyle(element, '::after').transform)

    expect(first).not.toBe(second)
  })

  it('sweeps the other way in right-to-left', () => {
    renderInBrowser(
      <div dir="rtl">
        <Skeleton data-testid="rtl" />
      </div>,
      'auto'
    )
    renderInBrowser(<Skeleton data-testid="ltr" />, 'auto')
    const rtl = getComputedStyle(page.getByTestId('rtl').element(), '::after').animationName
    const ltr = getComputedStyle(page.getByTestId('ltr').element(), '::after').animationName

    expect(rtl).not.toBe(ltr)
  })

  it('stops the sweep with animation false', () => {
    renderInBrowser(<Skeleton animation={false} data-testid="skeleton" />, 'auto')

    expect(getComputedStyle(page.getByTestId('skeleton').element(), '::after').animationName).toBe('none')
  })

  it('swaps the sweep for an opacity pulse under reduced motion', async () => {
    renderInBrowser(<Skeleton data-testid="skeleton" />, 'auto')
    const element = page.getByTestId('skeleton').element()

    await setReducedMotion('reduce')

    expect(getComputedStyle(element).animationName).not.toBe('none')
    expect(getComputedStyle(element, '::after').display).toBe('none')
  })

  it('lets the caller className win on size and radius even when its css loads first', () => {
    addStyle('.mine { block-size: 77px; inline-size: 55px; border-radius: 2px; }', 'start')
    renderInBrowser(<Skeleton variant="rectangular" className="mine" data-testid="skeleton" />)
    const style = getComputedStyle(page.getByTestId('skeleton').element())

    expect(style.height).toBe('77px')
    expect(style.width).toBe('55px')
    expect(style.borderTopLeftRadius).toBe('2px')
  })
})

describe('Loading in a real browser', () => {
  it('spins the ring with a rotate transform on a loop', async () => {
    renderInBrowser(<Loading data-testid="loading" />, 'auto')
    const spinner = page.getByTestId('loading').element().querySelector('[data-slot="loading-spinner"]') as HTMLElement
    const style = getComputedStyle(spinner)

    expect(style.animationName).not.toBe('none')
    expect(style.animationDuration).toBe('0.8s')
    expect(style.animationIterationCount).toBe('infinite')
    expect(style.animationTimingFunction).toBe('linear')

    const [first, second] = await sampleTransforms(() => getComputedStyle(spinner).transform)

    expect(first).not.toBe(second)
  })

  it('does not spin with animation false or the never mode', () => {
    renderInBrowser(
      <>
        <Loading animation={false} data-testid="off" />
        <InlineLoading animation={false} data-testid="inline" />
      </>,
      'auto'
    )
    const spinnerOf = (id: string) => page.getByTestId(id).element().querySelector('[data-slot$="spinner"]') as HTMLElement

    expect(getComputedStyle(spinnerOf('off')).animationName).toBe('none')
    expect(getComputedStyle(spinnerOf('inline')).animationName).toBe('none')
  })

  it('swaps the rotation for an opacity pulse under reduced motion', async () => {
    renderInBrowser(<Loading data-testid="loading" />, 'auto')
    const spinner = page.getByTestId('loading').element().querySelector('[data-slot="loading-spinner"]') as HTMLElement
    const spinning = getComputedStyle(spinner).animationName

    await setReducedMotion('reduce')

    expect(getComputedStyle(spinner).animationName).not.toBe('none')
    expect(getComputedStyle(spinner).animationName).not.toBe(spinning)
  })

  it('lets the caller className win on the layout gap even when its css loads first', () => {
    addStyle('.mine { gap: 33px; }', 'start')
    renderInBrowser(<Loading text="Salvando" className="mine" data-testid="loading" />)

    expect(getComputedStyle(page.getByTestId('loading').element()).rowGap).toBe('33px')
  })

  it('centers the blocking overlay content without a physical translate and fades it in', async () => {
    renderInBrowser(<Loading overlay text="Processando" data-testid="overlay" />, 'auto')
    const content = page.getByTestId('overlay').element().querySelector('[data-slot="loading-content"]') as HTMLElement
    const rect = content.getBoundingClientRect()
    const viewport = document.documentElement

    expect(getComputedStyle(content).translate).toBe('none')
    expect(Math.abs(rect.left + rect.width / 2 - viewport.clientWidth / 2)).toBeLessThan(10)
    expect(Math.abs(rect.top + rect.height / 2 - viewport.clientHeight / 2)).toBeLessThan(2)
    await expect.poll(() => getComputedStyle(content).opacity).toBe('1')
  })

  it('makes the page inert behind the overlay and locks the scroll', () => {
    const { container } = renderInBrowser(<Loading overlay text="Processando" />)

    expect(container).toHaveAttribute('inert')
    expect(document.body.style.overflow).toBe('hidden')
  })
})

describe('Card in a real browser', () => {
  it('lifts and deepens the shadow of an elevated card only with a fine pointer', async () => {
    renderInBrowser(<Card variant="elevated" data-testid="card">Conteúdo</Card>, 'auto')
    const card = page.getByTestId('card')

    expect(matchMedia('(hover: hover) and (pointer: fine)').matches).toBe(true)
    expect(getComputedStyle(card.element()).transform).toBe('none')

    await card.hover()

    await expect.poll(() => getComputedStyle(card.element()).transform).not.toBe('none')
  })

  it('does not lift on a touch device', async () => {
    await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 })
    try {
      renderInBrowser(<Card variant="elevated" data-testid="card">Conteúdo</Card>, 'auto')
      const card = page.getByTestId('card')

      expect(matchMedia('(hover: none)').matches).toBe(true)
      await card.hover()
      await new Promise((resolve) => setTimeout(resolve, 300))

      expect(getComputedStyle(card.element()).transform).toBe('none')
    } finally {
      await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: false })
    }
  })

  it('does not lift under reduced motion', async () => {
    await setReducedMotion('reduce')
    renderInBrowser(<Card variant="elevated" data-testid="card">Conteúdo</Card>, 'auto')
    const card = page.getByTestId('card')

    await card.hover()
    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(getComputedStyle(card.element()).transform).toBe('none')
  })

  it('lets the caller className win on padding and radius even when its css loads first', () => {
    addStyle('.mine { padding: 5px; border-radius: 3px; }', 'start')
    renderInBrowser(<Card className="mine" data-testid="card">Conteúdo</Card>)
    const style = getComputedStyle(page.getByTestId('card').element())

    expect(style.paddingTop).toBe('5px')
    expect(style.borderTopLeftRadius).toBe('3px')
  })

  it('lets the caller className win on colors even when its css loads first', () => {
    addStyle('.mine { background-color: rgb(1, 2, 3); }', 'start')
    renderInBrowser(<Card variant="outlined" className="mine" data-testid="card">Conteúdo</Card>)

    expect(getComputedStyle(page.getByTestId('card').element()).backgroundColor).toBe('rgb(1, 2, 3)')
  })
})
