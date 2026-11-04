import { describe, expect, it, vi } from 'vitest'

import { composeProps } from '@utils/composeProps.ts'

import type { SyntheticEvent } from 'react'

const fakeEvent = () => {
  const event = {
    defaultPrevented: false,
    preventDefault: () => {
      event.defaultPrevented = true
    }
  }

  return event as unknown as SyntheticEvent
}

describe('composeProps', () => {
  it('returns what the hook gives when the consumer gives nothing', () => {
    const own = { role: 'tab', tabIndex: 0 }

    expect(composeProps(own, undefined)).toEqual(own)
  })

  it('keeps the keys of the hook first and adds the ones of the consumer after them', () => {
    expect(Object.keys(composeProps({ role: 'tab', id: 'own' }, { className: 'mine', 'data-x': '1' }))).toEqual(['role', 'id', 'className', 'data-x'])
  })

  it('lets the consumer win on a plain prop, the id included', () => {
    expect(composeProps({ id: 'own', tabIndex: 0 }, { id: 'mine' })).toMatchObject({ id: 'mine', tabIndex: 0 })
  })

  it('runs the handler of the consumer first and then the one of the hook', () => {
    const own = vi.fn()
    const given = vi.fn()
    const merged = composeProps({ onClick: own }, { onClick: given })

    merged.onClick(fakeEvent())

    expect(given.mock.invocationCallOrder[0]).toBeLessThan(own.mock.invocationCallOrder[0])
  })

  it('runs the handler of the hook even when the consumer prevents the default', () => {
    const own = vi.fn()
    const merged = composeProps({ onKeyDown: own }, { onKeyDown: (event: SyntheticEvent) => event.preventDefault() })

    merged.onKeyDown(fakeEvent())

    expect(own).toHaveBeenCalledTimes(1)
  })

  it('keeps a handler that only one side has', () => {
    const own = vi.fn()
    const given = vi.fn()
    const merged = composeProps({ onClick: own }, { onKeyDown: given })

    merged.onClick(fakeEvent())
    merged.onKeyDown(fakeEvent())

    expect(own).toHaveBeenCalledTimes(1)
    expect(given).toHaveBeenCalledTimes(1)
  })
})
