import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, waitFor } from '@testing-library/react'
import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { renderToString } from 'react-dom/server'
import { useEffect, useState } from 'react'

import type { PortalContainer } from '@utils/portalContainer.ts'
import type { PortalContainerContractAdapter } from './types.ts'
import type { ReactElement } from 'react'

export const describePortalContainerContract = (adapter: PortalContainerContractAdapter) => {
  describe(`${adapter.name} · container`, () => {
    const hosts: HTMLElement[] = []
    const selector = `[data-slot="${adapter.slot}"]`

    const host = () => {
      const element = document.createElement('div')

      document.body.append(element)
      hosts.push(element)

      return element
    }

    afterEach(() => {
      hosts.splice(0).forEach((element) => element.remove())
    })

    const show = (ui: ReactElement) => (adapter.plain ? render(ui) : renderWithProviders(ui))

    const appear = async () => {
      await adapter.reveal?.()
      await waitFor(() => expect(document.querySelector(selector)).not.toBeNull())
    }

    const mount = async (container: PortalContainer | undefined) => {
      const view = show(adapter.render(container))

      await appear()

      return view
    }

    const where = () => document.querySelector(selector)?.parentElement

    it('renders as a child of the body without a container', async () => {
      await mount(undefined)

      expect(where()).toBe(document.body)
    })

    it('renders as a child of the element it is given', async () => {
      const element = host()

      await mount(element)

      expect(where()).toBe(element)
      expect(document.body.querySelectorAll(selector)).toHaveLength(1)
    })

    it('takes a function that returns the element', async () => {
      const element = host()

      await mount(() => element)

      expect(where()).toBe(element)
    })

    it('falls back to the body when the container is null or the function returns null', async () => {
      const { unmount } = await mount(null)

      expect(where()).toBe(document.body)
      unmount()

      await mount(() => null)

      expect(where()).toBe(document.body)
    })

    it('follows the container when it changes', async () => {
      const first = host()
      const second = host()
      let move: (element: HTMLElement) => void = () => undefined

      const Movable = () => {
        const [container, setContainer] = useState<HTMLElement>(first)

        useEffect(() => {
          move = setContainer
        }, [])

        return adapter.render(container)
      }

      show(<Movable />)
      await appear()

      expect(where()).toBe(first)

      act(() => move(second))

      await waitFor(() => expect(where()).toBe(second))
      expect(first.querySelector(selector)).toBeNull()
    })

    it('leaves the container when it unmounts', async () => {
      const element = host()
      const { unmount } = await mount(element)

      unmount()

      expect(element.querySelector(selector)).toBeNull()
      expect(document.body.querySelector(selector)).toBeNull()
    })

    it('does not look for the container while it renders on the server', () => {
      const find = vi.fn(() => document.body)

      renderToString(adapter.render(find))

      expect(find).not.toHaveBeenCalled()
    })
  })
}
