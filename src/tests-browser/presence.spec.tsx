import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import { usePresence } from '@hooks/usePresence.ts'
import { renderInBrowser } from './harness.tsx'

const duration = 120

const Panel = () => {
  const [open, setOpen] = useState(false)
  const { mounted, state, ref } = usePresence<HTMLDivElement>(open, { exitMs: 1000 })

  return (
    <>
      <style>{`
        [data-testid='panel'] { opacity: 0; transition: opacity ${duration}ms linear; }
        [data-testid='panel'][data-state='open'] { opacity: 1; }
      `}</style>
      <button onClick={() => setOpen((current) => !current)}>Alternar</button>
      {mounted && (
        <div ref={ref} data-testid="panel" data-state={state}>
          Painel
        </div>
      )}
    </>
  )
}

const panel = () => document.querySelector<HTMLElement>("[data-testid='panel']")

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('usePresence in a real browser', () => {
  it('fades in from entering to open and stays mounted until the exit transition really ends', async () => {
    renderInBrowser(<Panel />)
    const toggle = page.getByRole('button', { name: 'Alternar' })

    expect(panel()).toBeNull()

    await toggle.click()
    expect(panel()).not.toBeNull()
    await expect.poll(() => panel()?.dataset.state).toBe('open')
    await expect.poll(() => Number(getComputedStyle(panel() as HTMLElement).opacity)).toBe(1)

    const element = panel() as HTMLElement
    let transitionEnded = false
    let endedBeforeRemoval = false
    let removedAt = 0

    element.addEventListener('transitionend', (event) => {
      if (event.target === element && event.propertyName === 'opacity') transitionEnded = true
    })
    new MutationObserver((_, observer) => {
      if (element.isConnected) return
      endedBeforeRemoval = transitionEnded
      removedAt = performance.now()
      observer.disconnect()
    }).observe(document.body, { childList: true, subtree: true })

    const exitStartedAt = performance.now()

    await toggle.click()
    expect(element.dataset.state).toBe('exiting')
    await expect.poll(() => panel(), { timeout: 2000 }).toBeNull()

    expect(endedBeforeRemoval).toBe(true)
    expect(removedAt - exitStartedAt).toBeLessThan(900)
  })

  it('can be reopened in the middle of the exit and ends up open', async () => {
    renderInBrowser(<Panel />)
    const toggle = page.getByRole('button', { name: 'Alternar' })

    await toggle.click()
    await expect.poll(() => panel()?.dataset.state).toBe('open')

    await toggle.click()
    await wait(duration / 3)
    await toggle.click()

    await expect.poll(() => panel()?.dataset.state).toBe('open')
    await wait(duration * 2)
    expect(panel()).not.toBeNull()
  })
})
