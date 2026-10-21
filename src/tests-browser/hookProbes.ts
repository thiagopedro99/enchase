import { expect } from 'vitest'

import { renderInBrowser } from './harness.tsx'

export type Probe = [hook: string, value: string, target: () => Element | null | undefined, property: string, expected?: string | RegExp, pseudo?: string]

export const parts = (name: string) => [...document.body.querySelectorAll<HTMLElement>(`[data-slot="${name}"]`)]

export const part = (name: string, index = 0) => parts(name)[index]

export const at = (name: string, index = 0) => () => part(name, index)

export const style = (name: string, index = 0) => getComputedStyle(part(name, index))

export const onRoot = (variables: Record<string, string>) => {
  for (const [name, value] of Object.entries(variables)) document.documentElement.style.setProperty(name, value)
}

export const setHooks = (probes: Probe[]) => onRoot(Object.fromEntries(probes.map(([hook, value]) => [hook, value])))

export const readings = (probes: Probe[]) =>
  probes.map(([hook, value, target, property, expected, pseudo]) => {
    const element = target()
    const actual = element ? getComputedStyle(element, pseudo).getPropertyValue(property) : 'no element'
    const wanted = expected ?? value

    return [hook, (typeof wanted === 'string' ? actual === wanted : wanted.test(actual)) ? 'ok' : `${property} is ${actual}`]
  })

export const expectHooks = (probes: Probe[]) => expect(readings(probes)).toEqual(probes.map(([hook]) => [hook, 'ok']))

export const hooked = (probes: Probe[], ui: Parameters<typeof renderInBrowser>[0]) => {
  setHooks(probes)
  renderInBrowser(ui)
  expectHooks(probes)
}

export const becomes = (target: () => Element | null | undefined, property: string, value: string | RegExp, pseudo?: string) =>
  expect
    .poll(
      () => {
        const element = target()
        const actual = element ? getComputedStyle(element, pseudo).getPropertyValue(property) : 'no element'

        return typeof value === 'string' || !value.test(actual) ? actual : 'matches'
      },
      { timeout: 4000 }
    )
    .toBe(typeof value === 'string' ? value : 'matches')
