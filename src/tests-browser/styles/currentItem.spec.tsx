import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Sidebar } from '@components/common/Sidebar/index.tsx'
import Navbar from '@components/navbar/index.tsx'
import { renderInBrowser } from '../support/harness.tsx'
import { letGoOfTheMouse, parkMouse, pressMouse } from '../support/pointer.ts'
import { frames, waitForSettled } from '../support/settle.ts'

const sections = [
  {
    id: 'main',
    items: [
      { id: 'recursos', label: 'Recursos', href: '#recursos' },
      { id: 'contato', label: 'Contato', href: '#contato' }
    ]
  }
]

const steady = (background: string) => {
  const colors = { background, color: 'rgb(20, 16, 110)' }

  return { rest: colors, hover: colors, pressed: colors }
}

const sidebarCurrent = steady('rgba(0, 0, 0, 0)')

const navbarCurrent = steady('rgb(225, 224, 255)')

const current = () => document.querySelector<HTMLElement>('[aria-current]') as HTMLElement

const paint = (element: HTMLElement) => {
  const style = getComputedStyle(element)

  return { background: style.backgroundColor, color: style.color }
}

const settle = async (element: HTMLElement) => {
  await frames(3)
  await waitForSettled(() => element)
  await frames(1)
}

const measure = async () => {
  const element = current()

  element.setAttribute('data-measured', '')
  await parkMouse()
  await settle(element)
  const rest = paint(element)

  await userEvent.hover(element)
  await settle(element)
  expect(element.matches(':hover'), 'the pointer is over the item').toBe(true)
  const hover = paint(element)

  await pressMouse('[data-measured]')
  await settle(element)
  expect(element.matches(':active'), 'the item is pressed').toBe(true)
  const pressed = paint(element)
  await letGoOfTheMouse()

  return { rest, hover, pressed }
}

describe('the current item of the sidebar in a real browser, with the values of 0.22.0', () => {
  it('keeps its colors at rest, under the pointer and under the press', async () => {
    renderInBrowser(<Sidebar variant="permanent" sections={sections} activeSectionId="recursos" />)

    expect(await measure()).toEqual(sidebarCurrent)
  })
})

describe('the current item of the navbar in a real browser, with the values of 0.22.0', () => {
  it('keeps its colors at rest, under the pointer and under the press', async () => {
    renderInBrowser(<Navbar sections={sections} activeSectionId="recursos" />)

    expect(await measure()).toEqual(navbarCurrent)
  })
})
