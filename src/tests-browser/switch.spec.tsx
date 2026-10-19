import { afterEach, describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { contrastRatio } from '@styles/theme/contrast.ts'
import { Switch } from '@components/common/Switch/index.tsx'
import { renderInBrowser } from './harness.tsx'
import { unlessWebkit } from './browserSkips.ts'
import { setForcedColors, setReducedMotion } from './media.ts'
import { waitForSettled } from './settle.ts'

const added: HTMLStyleElement[] = []

const addStyle = (css: string) => {
  const style = document.createElement('style')
  style.textContent = css
  document.head.prepend(style)
  added.push(style)
}

afterEach(async () => {
  added.splice(0).forEach((style) => style.remove())
  await setForcedColors('none')
})

const part = (name: string, index = 0) => document.body.querySelectorAll<HTMLElement>(`[data-slot="${name}"]`)[index]

const surfaces = ['surface', 'background', 'surface-container-high'] as const

const surface = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(`--enchase-color-${name}`).trim()

const thumbOffset = (index = 0) => {
  const track = part('switch-track', index).getBoundingClientRect()
  const thumb = part('switch-thumb', index).getBoundingClientRect()
  const center = thumb.left + thumb.width / 2

  return document.documentElement.dir === 'rtl' ? track.right - center : center - track.left
}

const watchTransitions = (element: HTMLElement) => {
  const started: string[] = []

  element.addEventListener('transitionrun', (event) => started.push((event as TransitionEvent).propertyName))

  return started
}

describe('Switch in a real browser', () => {
  it.each(['light', 'dark'] as const)('keeps the track and the thumb distinguishable in both states in the %s theme', (mode) => {
    renderInBrowser(
      <>
        <Switch label="Desligado" />
        <Switch label="Ligado" defaultChecked />
      </>,
      'never',
      mode
    )
    const [off, on] = [0, 1].map((index) => ({ track: getComputedStyle(part('switch-track', index)), thumb: getComputedStyle(part('switch-thumb', index)) }))

    for (const name of surfaces) {
      expect(surface(name), name).not.toBe('')
      expect(contrastRatio(off.track.borderTopColor, surface(name)), `off track border on ${name}`).toBeGreaterThanOrEqual(3)
      expect(contrastRatio(on.track.backgroundColor, surface(name)), `on track on ${name}`).toBeGreaterThanOrEqual(3)
    }

    expect(contrastRatio(off.thumb.backgroundColor, off.track.backgroundColor), 'off thumb').toBeGreaterThanOrEqual(3)
    expect(contrastRatio(on.thumb.backgroundColor, on.track.backgroundColor), 'on thumb').toBeGreaterThanOrEqual(4.5)
  })

  it.each(['ltr', 'rtl'] as const)('slides the thumb from the start to the end of the track in %s text and keeps it inside', async (dir) => {
    document.documentElement.setAttribute('dir', dir)
    renderInBrowser(<Switch label="Ligar" />)
    const track = part('switch-track').getBoundingClientRect()
    const inside = () => {
      const thumb = part('switch-thumb').getBoundingClientRect()

      return thumb.left >= track.left && thumb.right <= track.right
    }

    expect(thumbOffset()).toBeCloseTo(16, 0)
    expect(inside()).toBe(true)

    await userEvent.click(page.getByText('Ligar'))

    expect(thumbOffset()).toBeCloseTo(36, 0)
    expect(inside()).toBe(true)

    await userEvent.click(part('switch-track'))

    expect(thumbOffset()).toBeCloseTo(16, 0)
  })

  it('toggles with a pointer on the track as well as on the label', async () => {
    renderInBrowser(<Switch label="Ligar" />)
    const input = page.getByRole('switch').element() as HTMLInputElement

    await userEvent.click(part('switch-track'))
    expect(input.checked).toBe(true)

    await userEvent.click(page.getByText('Ligar'))
    expect(input.checked).toBe(false)
  })

  it('shows a visible focus ring on the track when reached by keyboard', async () => {
    renderInBrowser(<Switch label="Ligar" />)

    await userEvent.tab()
    const style = getComputedStyle(part('switch-track'))

    expect(document.activeElement).toBe(page.getByRole('switch').element())
    expect(style.outlineStyle).toBe('solid')
    expect(parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2)

    for (const name of surfaces) expect(contrastRatio(style.outlineColor, surface(name)), name).toBeGreaterThanOrEqual(3)
  })

  it('toggles with Space from the keyboard', async () => {
    renderInBrowser(<Switch label="Ligar" />)

    await userEvent.tab()
    await userEvent.keyboard(' ')

    expect((page.getByRole('switch').element() as HTMLInputElement).checked).toBe(true)
    expect(thumbOffset()).toBeCloseTo(36, 0)
  })

  it('keeps the control at least 24 by 24 px with and without a label', () => {
    renderInBrowser(
      <>
        <Switch label="Ligar" />
        <Switch aria-label="Sem texto" />
      </>
    )

    for (const index of [0, 1]) {
      const root = part('switch', index).getBoundingClientRect()
      const track = part('switch-track', index).getBoundingClientRect()

      expect(root.width).toBeGreaterThanOrEqual(24)
      expect(root.height).toBeGreaterThanOrEqual(24)
      expect(track.width).toBeCloseTo(52, 0)
      expect(track.height).toBeCloseTo(32, 0)
    }
  })

  it('does not toggle when disabled and signals it with the cursor', async () => {
    renderInBrowser(<Switch label="Bloqueado" disabled />)
    const input = page.getByRole('switch').element() as HTMLInputElement

    await userEvent.click(page.getByText('Bloqueado'), { force: true })

    expect(input.checked).toBe(false)
    expect(getComputedStyle(part('switch-track')).cursor).toBe('not-allowed')
    expect(getComputedStyle(part('switch-label')).cursor).toBe('not-allowed')
  })

  it('lets the caller class win on layout even when its css loads before the library', () => {
    addStyle('.mine { min-block-size: 72px; gap: 21px; }')
    renderInBrowser(<Switch label="Ligar" wrapperClassName="mine" />)
    const style = getComputedStyle(part('switch'))

    expect(style.minHeight).toBe('72px')
    expect(style.columnGap).toBe('21px')
  })
})

describe('Switch motion in a real browser', () => {
  it('slides the thumb and fades the track with the duration of the fade recipe', async () => {
    renderInBrowser(<Switch label="Ligar" />, 'auto')
    const thumb = part('switch-thumb')
    const started = watchTransitions(thumb)
    const trackStarted = watchTransitions(part('switch-track'))

    expect(parseFloat(getComputedStyle(thumb).transitionDuration)).toBeCloseTo(0.15, 2)

    await userEvent.click(page.getByText('Ligar'))

    await expect.poll(() => started).toContain('transform')
    await expect.poll(() => trackStarted).toContain('background-color')
    await waitForSettled(() => part('switch'))
    expect(thumbOffset()).toBeCloseTo(36, 0)
  })

  it('takes the duration from the animation tuning', () => {
    renderInBrowser(<Switch label="Ligar" animation={{ tuning: { duration: 0.4 } }} />, 'auto')

    expect(parseFloat(getComputedStyle(part('switch-thumb')).transitionDuration)).toBeCloseTo(0.4, 2)
  })

  it.each([
    ['never mode', undefined, 'never'],
    ['animation={false}', false, 'auto']
  ] as const)('jumps straight to the end position with %s', async (_name, animation, motion) => {
    renderInBrowser(<Switch label="Ligar" animation={animation} />, motion)

    await userEvent.click(page.getByText('Ligar'))

    expect(part('switch').getAnimations({ subtree: true })).toEqual([])
    expect(parseFloat(getComputedStyle(part('switch-thumb')).transitionDuration)).toBe(0)
    expect(thumbOffset()).toBeCloseTo(36, 0)
  })

  it('stops moving the thumb under reduced motion but still fades its color', async () => {
    await setReducedMotion('reduce')
    renderInBrowser(<Switch label="Ligar" />, 'auto')
    const thumb = part('switch-thumb')
    const started = watchTransitions(thumb)

    await userEvent.click(page.getByText('Ligar'))

    expect(getComputedStyle(thumb).transitionProperty).not.toContain('transform')
    await expect.poll(() => started).toContain('background-color')
    expect(started).not.toContain('transform')
    expect(thumbOffset()).toBeCloseTo(36, 0)
  })
})

describe('Switch in forced colors', () => {
  const run = unlessWebkit('forcedColors') ? it : it.skip

  run('draws the thumb as a ring so the position still shows the state', async () => {
    renderInBrowser(
      <>
        <Switch label="Desligado" />
        <Switch label="Ligado" defaultChecked />
      </>
    )
    const border = (index: number) => getComputedStyle(part('switch-thumb', index)).borderTopColor

    expect(border(0)).toBe('rgba(0, 0, 0, 0)')
    expect(border(1)).toBe('rgba(0, 0, 0, 0)')

    await setForcedColors('active')

    expect(border(0)).not.toBe('rgba(0, 0, 0, 0)')
    expect(border(1)).not.toBe('rgba(0, 0, 0, 0)')
    expect(parseFloat(getComputedStyle(part('switch-thumb')).borderTopWidth)).toBeGreaterThanOrEqual(1)
    expect(thumbOffset(0)).toBeLessThan(thumbOffset(1))
  })
})
