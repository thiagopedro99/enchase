import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { shared } from '@utils/shared.ts'

const store = globalThis as unknown as Record<symbol, unknown>

const keyOf = (name: string) => Symbol.for(`enchase.${name}`)

const names: string[] = []

const unique = (label: string) => {
  const name = `test.${label}.${names.length}.v1`

  names.push(name)

  return name
}

const contexts: [string, string, () => Promise<Record<string, unknown>>][] = [
  ['UIContext', 'UIContext', () => import('@components/uiProvider/context.ts')],
  ['NavigateContext', 'NavigateContext', () => import('@components/uiProvider/navigationContext.ts')],
  ['CurrentHrefContext', 'CurrentHrefContext', () => import('@components/uiProvider/navigationContext.ts')],
  ['ColorModeContext', 'ColorModeContext', () => import('@components/colorMode/context.ts')],
  ['ThemeDefaultsContext', 'ThemeDefaultsContext', () => import('@components/colorMode/themeDefaults.ts')],
  ['PopoverControlContext', 'PopoverControlContext', () => import('@components/common/Popover/popoverControl.ts')],
  ['PopoverTreeContext', 'PopoverTreeContext', () => import('@components/common/Popover/popoverTree.ts')],
  ['ToastContext', 'ToastContext', () => import('@components/toast/context.ts')]
]

afterEach(() => {
  names.splice(0).forEach((name) => {
    delete store[keyOf(name)]
  })
})

describe('shared', () => {
  it('creates the value once and hands the same one to every later call', () => {
    const name = unique('once')
    const create = vi.fn(() => ({ count: 0 }))

    const first = shared(name, create)
    const second = shared(name, create)

    expect(second).toBe(first)
    expect(create).toHaveBeenCalledTimes(1)
  })

  it('keeps one value for each name', () => {
    const first = shared(unique('first'), () => ({}))
    const second = shared(unique('second'), () => ({}))

    expect(second).not.toBe(first)
  })

  it('keeps the value on the global symbol registry, where a copy of the module finds it', () => {
    const name = unique('registry')
    const value = shared(name, () => ({}))

    expect(store[keyOf(name)]).toBe(value)
  })
})

describe('a second copy of a module that holds a context', () => {
  it.each(contexts)('hands the %s of the first copy to the second', async (_label, name, load) => {
    const first = await load()

    vi.resetModules()

    const second = await load()

    expect(second).not.toBe(first)
    expect(second[name]).toBe(first[name])
  })
})

describe('a second copy of a module that holds state', () => {
  it('keeps the page locked until the last copy lets go of the scroll', async () => {
    const first = await import('@hooks/useScrollLock.ts')

    vi.resetModules()

    const second = await import('@hooks/useScrollLock.ts')
    const lockedByFirst = renderHook(() => first.useScrollLock())
    const lockedBySecond = renderHook(() => second.useScrollLock())

    expect(document.body.style.overflow).toBe('hidden')

    lockedByFirst.unmount()

    expect(document.body.style.overflow).toBe('hidden')

    lockedBySecond.unmount()

    expect(document.body.style.overflow).toBe('')
  })

  it('puts the overlay of the second copy above the one of the first, and gives the top back when it closes', async () => {
    const first = await import('@hooks/useOverlayStack.ts')

    vi.resetModules()

    const second = await import('@hooks/useOverlayStack.ts')
    const lower = renderHook(() => first.useOverlayStack(true))
    const upper = renderHook(() => second.useOverlayStack(true))

    expect(upper.result.current()).toBe(true)
    expect(lower.result.current()).toBe(false)

    upper.unmount()

    expect(lower.result.current()).toBe(true)

    lower.unmount()
  })

  it('lets the second copy read the target that the first one recorded, and forget it', async () => {
    const first = await import('@hooks/interactionTarget.ts')

    vi.resetModules()

    const second = await import('@hooks/interactionTarget.ts')
    const button = document.createElement('button')

    document.body.append(button)
    button.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(second.lastInteractionTarget()).toBe(button)

    first.resetInteractionTarget()

    expect(second.lastInteractionTarget()).toBeNull()

    button.remove()
  })

  it('tells the listeners of the first copy when the second one writes the color mode', async () => {
    const first = await import('@components/colorMode/defaultData.ts')

    vi.resetModules()

    const second = await import('@components/colorMode/defaultData.ts')
    const notify = vi.fn()
    const stop = first.subscribeToStoredMode('shared-test', notify)

    second.writeStoredMode(window.localStorage, 'shared-test', 'dark')

    expect(notify).toHaveBeenCalledTimes(1)

    stop()
    window.localStorage.clear()
  })
})
