import { expect } from 'vitest'

export const isSettled = (element: Element | null | undefined) => (element ? element.getAnimations({ subtree: true }).every((animation) => !(animation instanceof CSSTransition)) : false)

export const waitForSettled = (read: () => Element | null | undefined, timeout = 4000) => expect.poll(() => isSettled(read()), { timeout }).toBe(true)

export const nextEvent = (target: EventTarget, type: string, timeout = 4000) =>
  new Promise<Event>((resolve, reject) => {
    const timer = setTimeout(() => {
      target.removeEventListener(type, handler)
      reject(new Error(`no ${type} event in ${timeout}ms`))
    }, timeout)
    const handler = (event: Event) => {
      clearTimeout(timer)
      resolve(event)
    }

    target.addEventListener(type, handler, { once: true })
  })

export const nextExit = (read: () => Element | null | undefined, timeout = 4000) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      observer.disconnect()
      reject(new Error(`no exit started in ${timeout}ms`))
    }, timeout)
    const observer = new MutationObserver(() => {
      if (read()?.getAttribute('data-state') !== 'exiting') return

      clearTimeout(timer)
      observer.disconnect()
      resolve()
    })

    observer.observe(document.body, { attributes: true, childList: true, subtree: true })
  })

export const soak = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export const frames = async (count = 2) => {
  for (let index = 0; index < count; index += 1) await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
}

export const isStable = async (read: () => Element | null | undefined, count = 3) => {
  let previous = ''

  for (let index = 0; index < count; index += 1) {
    const box = read()?.getBoundingClientRect()
    const current = box ? `${box.left},${box.top},${box.width},${box.height}` : 'none'
    if (index > 0 && current !== previous) return false
    previous = current
    await frames(1)
  }

  return previous !== 'none'
}
