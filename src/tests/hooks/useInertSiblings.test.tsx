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

  it('keeps a toast host that sits inside the page reachable, and makes inert what is around it', () => {
    const wrapper = addToBody('<main id="app"><p id="content">content</p><div data-slot="toast-host"><div role="region" id="viewport"></div></div><aside id="side">side</aside></main>')
    const app = wrapper.querySelector('#app') as HTMLElement
    const toastHost = wrapper.querySelector('[data-slot="toast-host"]') as HTMLElement
    const { unmount } = mountDialog()

    expect(wrapper).not.toHaveAttribute('inert')
    expect(app).not.toHaveAttribute('inert')
    expect(toastHost).not.toHaveAttribute('inert')
    expect(wrapper.querySelector('#viewport')?.closest('[inert]')).toBeNull()
    expect(wrapper.querySelector('#content')).toHaveAttribute('inert')
    expect(wrapper.querySelector('#side')).toHaveAttribute('inert')

    unmount()

    expect(document.querySelectorAll('[inert]')).toHaveLength(0)
  })

  it('keeps every toast host of the page reachable', () => {
    const first = addToBody('<section><p id="first-content">first</p><div data-slot="toast-host" id="first-host"></div></section>')
    const second = addToBody('<section><p id="second-content">second</p><div data-slot="toast-host" id="second-host"></div></section>')
    const { unmount } = mountDialog()

    expect(first.querySelector('#first-host')).not.toHaveAttribute('inert')
    expect(second.querySelector('#second-host')).not.toHaveAttribute('inert')
    expect(first.querySelector('#first-content')).toHaveAttribute('inert')
    expect(second.querySelector('#second-content')).toHaveAttribute('inert')

    unmount()
  })

  it('leaves a toast host inside the dialog alone', () => {
    const Holder = () => {
      const ref = useRef<HTMLDivElement>(null)
      useInertSiblings(ref)

      return (
        <div ref={ref}>
          <p id="inside">inside</p>
          <div data-slot="toast-host" id="inner-host">
            <span id="inner-child">child</span>
          </div>
        </div>
      )
    }
    const outside = addToBody('<p id="outside">outside</p>')
    const { container, unmount } = render(<Holder />, { container: addToBody('').appendChild(document.createElement('div')) })

    expect(outside.querySelector('#outside')?.closest('[inert]')).not.toBeNull()
    expect(container.querySelector('#inside')).not.toHaveAttribute('inert')
    expect(container.querySelector('#inner-host')).not.toHaveAttribute('inert')
    expect(container.querySelector('#inner-child')).not.toHaveAttribute('inert')

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
