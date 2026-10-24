import { afterEach, describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { useRef } from 'react'

import { inertExemptSlot, useInertSiblings } from '@hooks/useInertSiblings.ts'

const Dialog = ({ active = true }: { active?: boolean }) => {
  const ref = useRef<HTMLDivElement>(null)
  useInertSiblings(ref, active)

  return <div ref={ref}>Caixa</div>
}

const added: HTMLElement[] = []

const addToBody = (html: string) => {
  const element = document.createElement('div')
  element.innerHTML = html
  document.body.append(element)
  added.push(element)

  return element
}

const mountDialog = (active = true) => {
  const host = addToBody('<p id="neighbor">vizinho</p>')

  return { host, ...render(<Dialog active={active} />, { container: host.appendChild(document.createElement('div')) }) }
}

afterEach(() => {
  added.splice(0).forEach((element) => element.remove())
})

describe('useInertSiblings', () => {
  it('makes the siblings of the dialog and of its ancestors inert, and gives them back on cleanup', () => {
    const app = addToBody('<main id="app">app</main>')
    const { host, unmount } = mountDialog()

    expect(host.querySelector('#neighbor')).toHaveAttribute('inert')
    expect(app).toHaveAttribute('inert')

    unmount()

    expect(host.querySelector('#neighbor')).not.toHaveAttribute('inert')
    expect(app).not.toHaveAttribute('inert')
  })

  it('never makes a script inert', () => {
    const script = document.createElement('script')
    document.body.append(script)
    const { unmount } = mountDialog()

    expect(script).not.toHaveAttribute('inert')

    unmount()
    script.remove()
  })

  it('leaves the host of the toasts reachable, so a toast fired over a dialog can be read and closed', () => {
    const toastHost = addToBody('<div data-slot="toast-viewport" role="region"></div>')
    toastHost.setAttribute('data-slot', inertExemptSlot)
    const viewport = toastHost.firstElementChild as HTMLElement
    const app = addToBody('<main>app</main>')
    const { unmount } = mountDialog()

    expect(toastHost).not.toHaveAttribute('inert')
    expect(viewport.closest('[inert]')).toBeNull()
    expect(app).toHaveAttribute('inert')

    unmount()
  })

  it('keeps inert what was already inert when it cleans up', () => {
    const settled = addToBody('<aside inert>já inerte</aside>').firstElementChild as HTMLElement
    const { unmount } = mountDialog()

    unmount()

    expect(settled).toHaveAttribute('inert')
  })

  it('does nothing while it is not active', () => {
    const app = addToBody('<main>app</main>')
    const { host } = mountDialog(false)

    expect(app).not.toHaveAttribute('inert')
    expect(host.querySelector('#neighbor')).not.toHaveAttribute('inert')
  })
})
