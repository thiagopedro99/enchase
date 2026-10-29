import { afterEach, describe, expect, it } from 'vitest'

import { autoUpdate } from '../../positioning/index.ts'

const added: HTMLElement[] = []

const make = (parent: HTMLElement, css: string) => {
  const element = document.createElement('div')
  element.style.cssText = css
  parent.append(element)
  added.push(element)

  return element
}

const frames = (count: number) => new Promise<void>((resolve) => {
  const step = (left: number) => (left <= 0 ? resolve() : requestAnimationFrame(() => step(left - 1)))
  step(count)
})

const settle = async () => {
  await frames(4)
  await new Promise((resolve) => setTimeout(resolve, 50))
}

afterEach(() => {
  added.splice(0).forEach((element) => element.remove())
})

describe('autoUpdate in a real browser', () => {
  it('updates once at the start and again when an ancestor scrolls', async () => {
    const scroller = make(document.body, 'position: fixed; left: 20px; top: 20px; width: 300px; height: 200px; overflow: auto')
    const reference = make(scroller, 'margin-top: 100px; width: 40px; height: 20px')
    make(scroller, 'height: 800px')
    const floating = make(document.body, 'position: fixed; width: 50px; height: 30px')
    const calls = { count: 0 }
    const stop = autoUpdate(reference, floating, () => {
      calls.count += 1
    })
    await settle()
    const before = calls.count
    scroller.scrollTop = 60
    await settle()
    stop()

    expect(before).toBeGreaterThanOrEqual(1)
    expect(calls.count).toBeGreaterThan(before)
  })

  it('updates when the floating element or the reference changes size', async () => {
    const reference = make(document.body, 'position: fixed; left: 100px; top: 100px; width: 40px; height: 20px')
    const floating = make(document.body, 'position: fixed; width: 50px; height: 30px')
    const calls = { count: 0 }
    const stop = autoUpdate(reference, floating, () => {
      calls.count += 1
    })
    await settle()
    const initial = calls.count
    floating.style.width = '120px'
    await settle()
    const afterFloating = calls.count
    reference.style.width = '90px'
    await settle()
    stop()

    expect(afterFloating).toBeGreaterThan(initial)
    expect(calls.count).toBeGreaterThan(afterFloating)
  })

  it('notices a reference that moves without scrolling or resizing', async () => {
    const reference = make(document.body, 'position: fixed; left: 100px; top: 100px; width: 40px; height: 20px')
    const floating = make(document.body, 'position: fixed; width: 50px; height: 30px')
    const calls = { count: 0 }
    const stop = autoUpdate(reference, floating, () => {
      calls.count += 1
    })
    await settle()
    const before = calls.count
    reference.style.left = '400px'
    await settle()
    await new Promise((resolve) => setTimeout(resolve, 100))
    stop()

    expect(calls.count).toBeGreaterThan(before)
  })

  it('follows an animated reference on every frame when asked to', async () => {
    const reference = make(document.body, 'position: fixed; left: 0; top: 100px; width: 40px; height: 20px')
    const floating = make(document.body, 'position: fixed; width: 50px; height: 30px')
    const calls = { count: 0 }
    const stop = autoUpdate(
      reference,
      floating,
      () => {
        calls.count += 1
      },
      { everyFrame: true }
    )
    const mover = reference.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(300px)' }], { duration: 400, fill: 'forwards' })
    await new Promise((resolve) => setTimeout(resolve, 450))
    stop()
    mover.cancel()

    expect(calls.count).toBeGreaterThan(10)
  })

  it('stops everything when cleaned up', async () => {
    const scroller = make(document.body, 'position: fixed; left: 20px; top: 20px; width: 300px; height: 200px; overflow: auto')
    const reference = make(scroller, 'margin-top: 100px; width: 40px; height: 20px')
    make(scroller, 'height: 800px')
    const floating = make(document.body, 'position: fixed; width: 50px; height: 30px')
    const calls = { count: 0 }
    const stop = autoUpdate(reference, floating, () => {
      calls.count += 1
    }, { everyFrame: true })
    await settle()
    stop()
    const stopped = calls.count
    scroller.scrollTop = 80
    floating.style.width = '200px'
    reference.style.marginTop = '10px'
    await settle()
    await new Promise((resolve) => setTimeout(resolve, 150))

    expect(calls.count).toBe(stopped)
  })

  it('does not call back after cleanup from inside an update', async () => {
    const reference = make(document.body, 'position: fixed; left: 100px; top: 100px; width: 40px; height: 20px')
    const floating = make(document.body, 'position: fixed; width: 50px; height: 30px')
    const calls = { count: 0 }
    const handle: { stop?: () => void } = {}
    handle.stop = autoUpdate(
      reference,
      floating,
      () => {
        calls.count += 1
        handle.stop?.()
      },
      { everyFrame: true }
    )
    reference.style.left = '200px'
    await settle()
    const stopped = calls.count
    reference.style.left = '300px'
    await settle()

    expect(calls.count).toBe(stopped)
  })
})
