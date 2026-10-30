import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { at, becomes, hooked, onRoot, part } from '../support/hookProbes.ts'
import { renderInBrowser } from '../support/harness.tsx'
import { fieldKinds } from '../support/fields.tsx'

import type { CSSProperties } from 'react'

afterEach(() => {
  document.documentElement.removeAttribute('style')
})

const transparent = 'rgba(0, 0, 0, 0)'

const background = (name: string) => getComputedStyle(part(name)).backgroundColor

describe.each(fieldKinds)('the background of the $name field from the shared hooks', ({ native, fill, render }) => {
  it('keeps the transparent background of today at rest, under the pointer, in focus and disabled', async () => {
    const { unmount } = renderInBrowser(render())

    expect(background(fill)).toBe(transparent)

    await userEvent.hover(part(fill))

    expect(part(fill).matches(':hover')).toBe(true)
    expect(background(fill)).toBe(transparent)

    part(native).focus()

    expect(document.activeElement).toBe(part(native))
    expect(background(fill)).toBe(transparent)
    unmount()
    renderInBrowser(render({ disabled: true }))

    expect(part(native).matches(':disabled')).toBe(true)
    expect(background(fill)).toBe(transparent)
  })

  it('takes the background at rest from its hook', () => {
    hooked([['--enchase-input-field-background', 'rgb(1, 2, 3)', at(fill), 'background-color']], render())
  })

  it('takes the background under the pointer from its hook, and only there', async () => {
    onRoot({ '--enchase-input-field-background-hover': 'rgb(4, 5, 6)' })
    renderInBrowser(render())

    expect(background(fill)).toBe(transparent)

    await userEvent.hover(part(fill))
    await becomes(at(fill), 'background-color', 'rgb(4, 5, 6)')
  })

  it('takes the background in focus from its hook, and only there', async () => {
    onRoot({ '--enchase-input-field-background-focus': 'rgb(7, 8, 9)' })
    renderInBrowser(render())

    expect(background(fill)).toBe(transparent)

    part(native).focus()
    await becomes(at(fill), 'background-color', 'rgb(7, 8, 9)')
  })

  it('takes the background of a disabled field from its hook, also under the pointer', async () => {
    onRoot({ '--enchase-input-field-background-disabled': 'rgb(10, 11, 12)', '--enchase-input-field-background-hover': 'rgb(4, 5, 6)' })
    renderInBrowser(render({ disabled: true }))

    expect(background(fill)).toBe('rgb(10, 11, 12)')

    await userEvent.hover(part(fill))

    expect(background(fill)).toBe('rgb(10, 11, 12)')
  })

  it('takes the hooks from the style of the wrapper, so one field alone can set them', async () => {
    renderInBrowser(render({ wrapperStyle: { '--enchase-input-field-background': 'rgb(1, 2, 3)', '--enchase-input-field-background-hover': 'rgb(4, 5, 6)' } as CSSProperties }))

    expect(background(fill)).toBe('rgb(1, 2, 3)')

    await userEvent.hover(part(fill))
    await becomes(at(fill), 'background-color', 'rgb(4, 5, 6)')
  })
})
