import { observeMove } from './observeMove.ts'

import type { VirtualElement } from './types.ts'

export type AutoUpdateOptions = {
  everyFrame?: boolean
  observeMovement?: boolean
}

const keyOf = (rect: DOMRect) => `${rect.x},${rect.y},${rect.width},${rect.height}`

export const autoUpdate = (reference: Element | VirtualElement, floating: HTMLElement, update: () => void, { everyFrame = false, observeMovement = true }: AutoUpdateOptions = {}) => {
  const state = { active: true, frame: 0, reobserve: 0, last: '' }
  const element = reference instanceof Element ? reference : reference.contextElement
  const run = () => {
    if (state.active) update()
  }
  const observer: ResizeObserver = new ResizeObserver(([entry]) => {
    if (entry?.target === element) {
      observer.unobserve(floating)
      cancelAnimationFrame(state.reobserve)
      state.reobserve = requestAnimationFrame(() => observer.observe(floating))
    }
    run()
  })
  if (element && !everyFrame) observer.observe(element)
  observer.observe(floating)

  const stopMove = element && !everyFrame && observeMovement ? observeMove(element, run) : undefined
  const targets: EventTarget[] = [window, ...(window.visualViewport ? [window.visualViewport] : [])]
  targets.forEach((target) => target.addEventListener('resize', run))
  targets.forEach((target) => target.addEventListener('scroll', run, { capture: true, passive: true }))

  const loop = () => {
    const key = keyOf(reference.getBoundingClientRect())
    if (key !== state.last) run()
    state.last = key
    if (state.active) state.frame = requestAnimationFrame(loop)
  }
  if (everyFrame) loop()
  else update()

  return () => {
    state.active = false
    cancelAnimationFrame(state.frame)
    cancelAnimationFrame(state.reobserve)
    stopMove?.()
    observer.disconnect()
    targets.forEach((target) => target.removeEventListener('resize', run))
    targets.forEach((target) => target.removeEventListener('scroll', run, { capture: true }))
  }
}
