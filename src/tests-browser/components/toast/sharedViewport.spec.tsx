import { useRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { render } from '@testing-library/react'

import { ColorModeProvider } from '@components/colorMode/index.tsx'
import UIProvider from '@components/uiProvider/index.tsx'
import { ToastProvider, useToast } from '@components/toast/index.ts'
import { GlobalStyles } from '@styles/react.tsx'
import { ptBR } from '@locales/ptBR.ts'
import { isSettled, isStable, soak } from '../../support/settle.ts'

import type { ToastPosition } from '@components/toast/types.ts'
import type { ReactElement } from 'react'

const renderProviders = (ui: ReactElement, motion: 'auto' | 'never' = 'never') =>
  render(
    <ColorModeProvider defaultMode="light" storage={null}>
      <GlobalStyles />
      <UIProvider locale={ptBR} motion={{ mode: motion }} navigate={() => undefined} currentHref="/">
        {ui}
      </UIProvider>
    </ColorModeProvider>
  )

const items = () => [...document.querySelectorAll<HTMLElement>('[data-slot="toast"]')]

const itemWith = (text: string) => items().find((item) => item.textContent?.includes(text)) as HTMLElement

const regions = () => [...document.querySelectorAll<HTMLElement>('[data-slot="toast-viewport"]')]

const flipAnimations = () => items().flatMap((item) => item.getAnimations().filter((animation) => animation.id === 'enchase-flip'))

const Launcher = ({ name, duration }: { name: string; duration: number }) => {
  const toast = useToast()
  const count = useRef(0)

  return (
    <button
      style={{ margin: 8, padding: '8px 16px' }}
      onClick={() => {
        count.current += 1
        toast.info(`${name}${count.current}`, duration)
      }}
    >
      {`launch ${name}`}
    </button>
  )
}

const Two = ({ duration = 60000, second }: { duration?: number; second?: ToastPosition }) => (
  <>
    <ToastProvider>
      <Launcher name="A" duration={duration} />
    </ToastProvider>
    <ToastProvider position={second}>
      <Launcher name="B" duration={duration} />
    </ToastProvider>
  </>
)

const fire = async (...names: string[]) => {
  for (const name of names) await userEvent.click(page.getByRole('button', { name: `launch ${name}` }))
  await expect.poll(() => items().filter((item) => item.dataset.state === 'open').length).toBe(names.length)
  await expect.poll(() => items().every((item) => isSettled(item))).toBe(true)
  await expect.poll(async () => (await Promise.all(items().map((item) => isStable(() => item)))).every(Boolean), { timeout: 4000 }).toBe(true)
}

describe('two toast providers on one page in a real browser', () => {
  it('stack their toasts in one region, oldest first and without overlap', async () => {
    renderProviders(<Two />)
    await fire('A', 'B', 'A')

    const [first, second, third] = items().map((item) => item.getBoundingClientRect())

    expect(regions()).toHaveLength(1)
    expect(items().map((item) => item.textContent)).toEqual([expect.stringContaining('A1'), expect.stringContaining('B1'), expect.stringContaining('A2')])
    expect(second.top).toBeGreaterThanOrEqual(first.bottom - 1)
    expect(third.top).toBeGreaterThanOrEqual(second.bottom - 1)
    expect(Math.abs(second.right - first.right)).toBeLessThanOrEqual(1)
    expect(Math.abs(third.right - first.right)).toBeLessThanOrEqual(1)
  })

  it('stack them from the bottom corner too', async () => {
    renderProviders(
      <>
        <ToastProvider position="bottom-start">
          <Launcher name="A" duration={60000} />
        </ToastProvider>
        <ToastProvider position="bottom-start">
          <Launcher name="B" duration={60000} />
        </ToastProvider>
      </>
    )
    await fire('A', 'B')

    const [first, second] = items().map((item) => item.getBoundingClientRect())

    expect(regions()).toHaveLength(1)
    expect(second.top).toBeGreaterThanOrEqual(first.bottom - 1)
  })

  it('keep the toasts of different positions in their own corners', async () => {
    renderProviders(<Two second="bottom-end" />)
    await fire('A', 'B')

    expect(regions()).toHaveLength(2)
    expect(itemWith('A1').getBoundingClientRect().bottom).toBeLessThan(itemWith('B1').getBoundingClientRect().top)
  })

  it('slide the toast that follows into the gap when the toast of the other provider closes', async () => {
    renderProviders(<Two />, 'auto')
    await fire('A', 'B', 'A')
    const gap = itemWith('B1').getBoundingClientRect().top

    await userEvent.click(itemWith('B1').querySelector('[data-slot="toast-close"]') as HTMLElement)

    await expect.poll(() => flipAnimations().length, { timeout: 4000 }).toBeGreaterThan(0)
    await expect.poll(() => items().length).toBe(2)
    await expect.poll(() => flipAnimations().length, { timeout: 4000 }).toBe(0)
    expect(Math.abs(itemWith('A2').getBoundingClientRect().top - gap)).toBeLessThanOrEqual(1)
  })

  it('slide the toast of the other provider into the gap when the first provider closes one', async () => {
    renderProviders(<Two />, 'auto')
    await fire('A', 'B')
    const gap = itemWith('A1').getBoundingClientRect().top

    await userEvent.click(itemWith('A1').querySelector('[data-slot="toast-close"]') as HTMLElement)

    await expect.poll(() => flipAnimations().length, { timeout: 4000 }).toBeGreaterThan(0)
    await expect.poll(() => items().length).toBe(1)
    await expect.poll(() => flipAnimations().length, { timeout: 4000 }).toBe(0)
    expect(Math.abs(itemWith('B1').getBoundingClientRect().top - gap)).toBeLessThanOrEqual(1)
  })

  it('stop the countdown of every toast while the pointer is over one, and resume it after', async () => {
    renderProviders(<Two duration={900} />)
    await fire('A', 'B')

    await userEvent.hover(itemWith('B1'))
    await soak(1400)

    expect(items()).toHaveLength(2)
    expect(items().every((item) => item.hasAttribute('data-paused'))).toBe(true)

    await userEvent.unhover(itemWith('B1'))

    await expect.poll(() => items().length, { timeout: 4000 }).toBe(0)
  })

  it('stop the countdown of every toast while the keyboard focus is on one of the other provider', async () => {
    renderProviders(<Two duration={900} />)
    await fire('A', 'B')

    ;(itemWith('B1').querySelector('[data-slot="toast-close"]') as HTMLElement).focus()
    await soak(1400)

    expect(items()).toHaveLength(2)
  })

  it('keep the toasts of the others in the same corner when the first provider leaves', async () => {
    const Dropping = () => {
      const [mounted, setMounted] = useState(true)

      return (
        <>
          {mounted && (
            <ToastProvider>
              <Launcher name="A" duration={60000} />
            </ToastProvider>
          )}
          <ToastProvider>
            <Launcher name="B" duration={60000} />
          </ToastProvider>
          <button onClick={() => setMounted(false)}>drop first</button>
        </>
      )
    }

    renderProviders(<Dropping />)
    await fire('A', 'B')
    const before = regions()[0].getBoundingClientRect()

    await userEvent.click(page.getByRole('button', { name: 'drop first' }))

    await expect.poll(() => items().filter((item) => item.dataset.state === 'open').length).toBe(1)
    await expect.poll(() => items().every((item) => isSettled(item))).toBe(true)

    const after = regions()[0].getBoundingClientRect()

    expect(regions()).toHaveLength(1)
    expect(itemWith('B1')).toBeDefined()
    expect(Math.abs(after.right - before.right)).toBeLessThanOrEqual(1)
    expect(Math.abs(after.top - before.top)).toBeLessThanOrEqual(1)
  })
})
