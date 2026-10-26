import { afterEach, describe, expect, it, vi } from 'vitest'

import { resolvePortalContainer } from '@utils/portalContainer.ts'

const hosts: HTMLElement[] = []

const host = () => {
  const element = document.createElement('div')

  document.body.append(element)
  hosts.push(element)

  return element
}

afterEach(() => {
  hosts.splice(0).forEach((element) => element.remove())
})

describe('resolvePortalContainer', () => {
  it('is the body without a container', () => {
    expect(resolvePortalContainer(undefined)).toBe(document.body)
  })

  it('is the body for null', () => {
    expect(resolvePortalContainer(null)).toBe(document.body)
  })

  it('returns the element it is given', () => {
    const element = host()

    expect(resolvePortalContainer(element)).toBe(element)
  })

  it('calls a function and returns its element', () => {
    const element = host()
    const find = vi.fn(() => element)

    expect(resolvePortalContainer(find)).toBe(element)
    expect(find).toHaveBeenCalledTimes(1)
  })

  it('falls back to the body when the function returns null', () => {
    expect(resolvePortalContainer(() => null)).toBe(document.body)
  })
})
