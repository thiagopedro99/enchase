import { afterEach, describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import { withProviders } from '@docs/shared/decorators/withProviders.tsx'
import { globalTypes, initialGlobals } from '@docs/shared/parameters.ts'

const attribute = () => document.documentElement.getAttribute('data-density')

const story = () => <p>Story</p>

const decorated = (density?: string) => withProviders(story, { globals: { theme: 'light', style: 'enchase', density, motion: 'never' }, parameters: {} } as never)

afterEach(() => {
  document.documentElement.removeAttribute('data-density')
})

describe('the density global of the Storybook', () => {
  it('is an item of the toolbar next to the theme, the style and the motion, with the default and the compact density, and starts on the default one', () => {
    const items = globalTypes.density?.toolbar?.items ?? []

    expect(Object.keys(globalTypes)).toEqual(['theme', 'style', 'density', 'motion'])
    expect(items.map((item) => (typeof item === 'string' ? item : item.value))).toEqual(['default', 'compact'])
    expect(initialGlobals.density).toBe('default')
  })

  it('leaves no attribute on the root with the default density', () => {
    render(decorated('default'))

    expect(attribute()).toBeNull()
  })

  it.each([undefined, 'spacious', ''])('leaves no attribute on the root with the value %j, which is not a density of the toolbar', (value) => {
    render(decorated(value))

    expect(attribute()).toBeNull()
  })

  it('puts data-density="compact" on the root, and on no other element, with the compact density', () => {
    const { container } = render(decorated('compact'))

    expect(attribute()).toBe('compact')
    expect(document.body.hasAttribute('data-density')).toBe(false)
    expect(container.querySelector('[data-density]')).toBeNull()
  })

  it('follows the global while the story stays mounted: it goes off when the global goes back to default, and on again', () => {
    const { rerender } = render(decorated('compact'))

    expect(attribute()).toBe('compact')

    rerender(decorated('default'))
    expect(attribute()).toBeNull()

    rerender(decorated('compact'))
    expect(attribute()).toBe('compact')
  })

  it('takes the attribute off when the story unmounts, so it does not stay on the page of the next story', () => {
    const { unmount } = render(decorated('compact'))

    expect(attribute()).toBe('compact')

    unmount()
    expect(attribute()).toBeNull()
  })

  it('gives the next story the density of its own global, not the one of the story before', () => {
    const first = render(decorated('compact'))

    first.unmount()

    const second = render(decorated('default'))

    expect(attribute()).toBeNull()

    second.unmount()
    render(decorated('compact'))
    expect(attribute()).toBe('compact')
  })
})
