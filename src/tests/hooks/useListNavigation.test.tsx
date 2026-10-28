import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { useRef } from 'react'

import { useListNavigation } from '@hooks/useListNavigation.ts'

import type { ListNavigationOptions } from '@hooks/useListNavigation.ts'
import type { KeyboardEvent } from 'react'

type HarnessProps = Omit<ListNavigationOptions, 'items'> & {
  labels?: string[]
  disabled?: number[]
  direction?: 'ltr' | 'rtl'
}

const defaultLabels = ['Alpha', 'Beta', 'Bravo', 'Charlie', 'Delta']

const Harness = ({ labels = defaultLabels, disabled = [], direction, ...options }: HarnessProps) => {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const navigate = useListNavigation({ items: labels.map((text, index) => ({ text, disabled: disabled.includes(index) })), ...options })

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = navigate(
      event,
      refs.current.findIndex((node) => node === document.activeElement)
    )

    if (target === undefined) return

    event.preventDefault()
    refs.current[target]?.focus()
  }

  return (
    <div role="toolbar" aria-label="items" tabIndex={-1} style={{ direction }} onKeyDown={handleKeyDown}>
      {labels.map((text, index) => (
        <button
          key={text}
          ref={(node) => {
            refs.current[index] = node
          }}
          type="button"
          disabled={disabled.includes(index)}
        >
          {text}
        </button>
      ))}
    </div>
  )
}

const focusItem = (name: string) => act(() => screen.getByRole('button', { name }).focus())

const focusToolbar = () => act(() => screen.getByRole('toolbar').focus())

const press = (key: string, init: KeyboardEventInit = {}) => fireEvent.keyDown(document.activeElement as Element, { key, ...init })

const focused = () => document.activeElement?.textContent

describe('useListNavigation', () => {
  describe('arrows', () => {
    it('moves to the next and to the previous item along the vertical axis by default', () => {
      render(<Harness />)
      focusItem('Alpha')
      press('ArrowDown')
      expect(focused()).toBe('Beta')
      press('ArrowDown')
      expect(focused()).toBe('Bravo')
      press('ArrowUp')
      expect(focused()).toBe('Beta')
    })

    it('leaves the arrows of the other axis alone', () => {
      render(<Harness />)
      focusItem('Beta')

      expect(press('ArrowRight')).toBe(true)
      expect(press('ArrowLeft')).toBe(true)
      expect(focused()).toBe('Beta')
    })

    it('wraps around at both ends by default', () => {
      render(<Harness />)
      focusItem('Delta')
      press('ArrowDown')
      expect(focused()).toBe('Alpha')
      press('ArrowUp')
      expect(focused()).toBe('Delta')
    })

    it('stops at the ends without looping, and still handles the key', () => {
      render(<Harness loop={false} />)
      focusItem('Delta')

      expect(press('ArrowDown')).toBe(false)
      expect(focused()).toBe('Delta')

      focusItem('Alpha')

      expect(press('ArrowUp')).toBe(false)
      expect(focused()).toBe('Alpha')
    })

    it('skips disabled items in both directions and wraps over them', () => {
      render(<Harness disabled={[0, 2, 4]} />)
      focusItem('Beta')
      press('ArrowDown')
      expect(focused()).toBe('Charlie')
      press('ArrowDown')
      expect(focused()).toBe('Beta')
      press('ArrowUp')
      expect(focused()).toBe('Charlie')
    })

    it('starts at the first enabled item with ArrowDown and at the last with ArrowUp when none is current', () => {
      render(<Harness disabled={[0, 4]} />)
      focusToolbar()
      press('ArrowDown')
      expect(focused()).toBe('Beta')

      focusToolbar()
      press('ArrowUp')
      expect(focused()).toBe('Charlie')
    })
  })

  describe('Home, End and the other keys', () => {
    it('goes to the first and to the last enabled item with Home and End', () => {
      render(<Harness disabled={[0, 4]} />)
      focusItem('Bravo')
      press('End')
      expect(focused()).toBe('Charlie')
      press('Home')
      expect(focused()).toBe('Beta')
    })

    it('leaves the keys it does not use for the caller', () => {
      render(<Harness typeahead />)
      focusItem('Beta')

      for (const key of ['Tab', 'Enter', 'Escape', 'PageDown', 'F2']) expect(press(key)).toBe(true)

      expect(focused()).toBe('Beta')
    })

    it('ignores a key that comes with Ctrl, Alt or Meta', () => {
      render(<Harness typeahead />)
      focusItem('Beta')

      for (const init of [{ ctrlKey: true }, { altKey: true }, { metaKey: true }]) {
        expect(press('ArrowDown', init)).toBe(true)
        expect(press('Home', init)).toBe(true)
        expect(press('c', init)).toBe(true)
      }

      expect(focused()).toBe('Beta')
    })

    it('ignores the arrows and Home with Shift', () => {
      render(<Harness />)
      focusItem('Beta')

      expect(press('ArrowDown', { shiftKey: true })).toBe(true)
      expect(press('Home', { shiftKey: true })).toBe(true)
      expect(focused()).toBe('Beta')
    })

    it('does nothing when every item is disabled', () => {
      render(<Harness disabled={[0, 1, 2, 3, 4]} typeahead />)
      focusToolbar()

      expect(press('ArrowDown')).toBe(true)
      expect(press('Home')).toBe(true)
      expect(press('a')).toBe(true)
    })
  })

  describe('orientation and direction', () => {
    it('moves with the horizontal arrows when horizontal, and ignores the vertical ones', () => {
      render(<Harness orientation="horizontal" />)
      focusItem('Alpha')
      press('ArrowRight')
      expect(focused()).toBe('Beta')
      press('ArrowLeft')
      expect(focused()).toBe('Alpha')

      expect(press('ArrowDown')).toBe(true)
      expect(press('ArrowUp')).toBe(true)
      expect(focused()).toBe('Alpha')
    })

    it('inverts the horizontal arrows in a right-to-left container', () => {
      render(<Harness orientation="horizontal" direction="rtl" />)
      focusItem('Beta')
      press('ArrowLeft')
      expect(focused()).toBe('Bravo')
      press('ArrowRight')
      expect(focused()).toBe('Beta')
    })

    it('answers to both axes when both, flipping only the horizontal ones in right-to-left', () => {
      const { unmount } = render(<Harness orientation="both" />)
      focusItem('Beta')
      press('ArrowDown')
      expect(focused()).toBe('Bravo')
      press('ArrowRight')
      expect(focused()).toBe('Charlie')
      press('ArrowUp')
      expect(focused()).toBe('Bravo')
      press('ArrowLeft')
      expect(focused()).toBe('Beta')

      unmount()
      render(<Harness orientation="both" direction="rtl" />)
      focusItem('Beta')
      press('ArrowDown')
      expect(focused()).toBe('Bravo')
      press('ArrowLeft')
      expect(focused()).toBe('Charlie')
      press('ArrowRight')
      expect(focused()).toBe('Bravo')
    })

    it('does not flip the vertical arrows in right-to-left', () => {
      render(<Harness direction="rtl" />)
      focusItem('Beta')
      press('ArrowDown')
      expect(focused()).toBe('Bravo')
    })
  })

  describe('typeahead', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    const advance = (milliseconds: number) => act(() => void vi.advanceTimersByTime(milliseconds))

    it('goes to the next item that starts with the typed letter, and cycles through the ones that share it', () => {
      render(<Harness typeahead />)
      focusItem('Alpha')
      press('b')
      expect(focused()).toBe('Beta')
      press('b')
      expect(focused()).toBe('Bravo')
      press('b')
      expect(focused()).toBe('Beta')
    })

    it('matches a longer prefix when the letters come in a row', () => {
      render(<Harness typeahead />)
      focusItem('Alpha')
      press('b')
      press('r')
      expect(focused()).toBe('Bravo')
    })

    it('stays on the current item while it still matches what was typed', () => {
      render(<Harness typeahead labels={['Alpha', 'Brave', 'Bravo', 'Brazil']} />)
      focusItem('Alpha')
      press('b')
      expect(focused()).toBe('Brave')
      press('r')
      expect(focused()).toBe('Brave')
      press('a')
      expect(focused()).toBe('Brave')
      press('v')
      expect(focused()).toBe('Brave')
      press('o')
      expect(focused()).toBe('Bravo')
    })

    it('starts a new search after the delay', () => {
      render(<Harness typeahead />)
      focusItem('Alpha')
      press('b')
      expect(focused()).toBe('Beta')
      advance(499)
      press('r')
      expect(focused()).toBe('Bravo')

      advance(500)
      press('c')

      expect(focused()).toBe('Charlie')
    })

    it('lets the delay restart with every letter', () => {
      render(<Harness typeahead />)
      focusItem('Alpha')
      press('b')
      advance(400)
      press('r')
      advance(400)
      press('a')
      expect(focused()).toBe('Bravo')
    })

    it('handles a capital letter as the same letter', () => {
      render(<Harness typeahead />)
      focusItem('Alpha')
      press('C', { shiftKey: true })
      expect(focused()).toBe('Charlie')
    })

    it('skips a disabled item that matches', () => {
      render(<Harness typeahead disabled={[1]} />)
      focusItem('Alpha')
      press('b')
      expect(focused()).toBe('Bravo')
    })

    it('leaves a letter without a match to the caller', () => {
      render(<Harness typeahead />)
      focusItem('Alpha')

      expect(press('z')).toBe(true)
      expect(focused()).toBe('Alpha')
    })

    it('does nothing with letters unless typeahead is on', () => {
      render(<Harness />)
      focusItem('Alpha')

      expect(press('b')).toBe(true)
      expect(focused()).toBe('Alpha')
    })

    it('leaves Space to the item while nothing was typed, and takes it as part of the search afterwards', () => {
      render(<Harness typeahead labels={['New file', 'New folder', 'Open']} />)
      focusItem('Open')

      expect(press(' ')).toBe(true)

      press('n')
      expect(focused()).toBe('New file')
      press('e')
      press('w')
      press(' ')
      press('f')
      press('o')
      expect(focused()).toBe('New folder')
    })

    it('searches from the first item when none is current', () => {
      render(<Harness typeahead />)
      focusToolbar()
      press('c')
      expect(focused()).toBe('Charlie')
    })

    it('clears its timer when the list unmounts', () => {
      const { unmount } = render(<Harness typeahead />)

      focusItem('Alpha')
      press('b')

      const pending = vi.getTimerCount()

      unmount()

      expect(vi.getTimerCount()).toBe(pending - 1)
    })
  })
})
