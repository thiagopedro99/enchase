import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Button } from '@components/common/Button/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Switch } from '@components/common/Switch/index.tsx'
import { Table } from '@components/common/Table/index.tsx'
import { Tabs } from '@components/common/Tabs/index.tsx'
import { renderInBrowser } from '../support/harness.tsx'

import type { CSSProperties, ReactNode } from 'react'

const items = [
  { value: 'one', label: 'One', content: <p>First</p> },
  { value: 'two', label: 'Two', content: <p>Second</p> }
]

const columns = [{ key: 'name', header: 'Name' }]

const rows = [{ name: 'Ana' }]

const scoped = (style: Record<string, string>, children: ReactNode) => <div style={style as CSSProperties}>{children}</div>

const part = (name: string) => document.body.querySelector(`[data-slot="${name}"]`) as HTMLElement

const ring = (element: HTMLElement) => {
  const style = getComputedStyle(element)

  return { width: style.outlineWidth, style: style.outlineStyle, offset: style.outlineOffset, color: style.outlineColor }
}

const borderWidth = (element: HTMLElement) => getComputedStyle(element).borderTopWidth

describe('the focus ring from the tokens', () => {
  it('keeps the 2px ring in the color of the theme, 2px away from the button', async () => {
    renderInBrowser(<Button>Save</Button>)
    await userEvent.tab()

    expect(document.activeElement).toBe(part('button'))
    expect(ring(part('button'))).toEqual({ width: '2px', style: 'solid', offset: '2px', color: 'rgb(79, 70, 229)' })
  })

  it('takes the width, the offset and the color of the ring from the tokens set on a container', async () => {
    renderInBrowser(scoped({ '--enchase-focus-width': '5px', '--enchase-focus-offset': '7px', '--enchase-focus-color': 'rgb(255, 0, 0)' }, <Button>Save</Button>))
    await userEvent.tab()

    expect(ring(part('button'))).toEqual({ width: '5px', style: 'solid', offset: '7px', color: 'rgb(255, 0, 0)' })
  })

  it('draws the global ring of an element with no rule of its own from the same tokens', async () => {
    renderInBrowser(scoped({ '--enchase-focus-width': '4px', '--enchase-focus-offset': '6px' }, <button type="button">Plain</button>))
    await userEvent.tab()

    expect(ring(document.querySelector('button') as HTMLElement)).toEqual({ width: '4px', style: 'solid', offset: '6px', color: 'rgb(79, 70, 229)' })
  })

  it('follows the primary color of the part of the page when no ring color is set', async () => {
    renderInBrowser(scoped({ '--enchase-color-primary': 'rgb(0, 128, 0)' }, <Button>Save</Button>))
    await userEvent.tab()

    expect(ring(part('button')).color).toBe('rgb(0, 128, 0)')
  })

  it('pulls the ring inside the tab with the inset offset token', async () => {
    renderInBrowser(<Tabs items={items} ariaLabel="Sections" />)
    await userEvent.tab()

    expect(document.activeElement).toBe(part('tabs-tab'))
    expect(ring(part('tabs-tab')).offset).toBe('-2px')
  })

  it('moves the inset offset of the tab with its token', async () => {
    renderInBrowser(scoped({ '--enchase-focus-offset-inset': '-4px' }, <Tabs items={items} ariaLabel="Sections" />))
    await userEvent.tab()

    expect(ring(part('tabs-tab')).offset).toBe('-4px')
  })

  it('keeps the ring of the switch 3px away from its track, and moves it with the selector offset token', async () => {
    const { unmount } = renderInBrowser(<Switch label="Alerts" />)

    await userEvent.tab()
    expect(ring(part('switch-track'))).toEqual({ width: '2px', style: 'solid', offset: '3px', color: 'rgb(79, 70, 229)' })
    unmount()

    renderInBrowser(scoped({ '--enchase-focus-offset-selector': '6px' }, <Switch label="Alerts" />))
    await userEvent.tab()
    expect(ring(part('switch-track')).offset).toBe('6px')
  })
})

describe('the focus ring and the border without the theme variables of the tokens', () => {
  it('keeps the 2px ring and the 1px border of the button when a theme written before the tokens only has the colors', async () => {
    render(scoped({ '--enchase-color-primary': 'rgb(0, 0, 255)' }, <Button>Save</Button>))
    await userEvent.tab()

    expect(ring(part('button'))).toEqual({ width: '2px', style: 'solid', offset: '2px', color: 'rgb(0, 0, 255)' })
    expect(borderWidth(part('button'))).toBe('1px')
  })

  it('keeps the 1px outline of the field, thickened to 2px with the focus, and the ring of the tab, without the tokens', async () => {
    render(scoped({ '--enchase-color-primary': 'rgb(0, 0, 255)', '--enchase-color-border-strong': 'rgb(120, 120, 120)' }, <><Input label="Name" /><Tabs items={items} ariaLabel="Sections" /></>))

    expect(borderWidth(part('input-outline'))).toBe('1px')
    await userEvent.tab()
    expect(borderWidth(part('input-outline'))).toBe('2px')
    await userEvent.tab()
    expect(ring(part('tabs-tab'))).toEqual({ width: '2px', style: 'solid', offset: '-2px', color: 'rgb(0, 0, 255)' })
  })
})

describe('the border width from the tokens', () => {
  it('keeps the 1px outline of the field, thickened to 2px while it has the focus', async () => {
    renderInBrowser(<Input label="Name" />)

    expect(borderWidth(part('input-outline'))).toBe('1px')

    await userEvent.tab()
    expect(borderWidth(part('input-outline'))).toBe('2px')
  })

  it('takes the width of the outline of the field from the tokens, at rest and with the focus', async () => {
    renderInBrowser(scoped({ '--enchase-border-width': '3px', '--enchase-border-width-strong': '4px' }, <Input label="Name" />))

    expect(borderWidth(part('input-outline'))).toBe('3px')

    await userEvent.tab()
    expect(borderWidth(part('input-outline'))).toBe('4px')
  })

  it('takes the border of the table and the thickness of the underline of the tabs from the tokens', () => {
    renderInBrowser(scoped({ '--enchase-border-width': '3px', '--enchase-border-width-strong': '5px' }, <><Table columns={columns} rows={rows} /><Tabs items={items} ariaLabel="Sections" /></>))

    expect(borderWidth(part('table'))).toBe('3px')
    expect(getComputedStyle(part('tabs-indicator')).blockSize).toBe('5px')
  })

  it('keeps the borders of the table and the track of the switch at their widths without the tokens set', () => {
    renderInBrowser(<><Table columns={columns} rows={rows} /><Switch label="Alerts" /></>)

    expect(borderWidth(part('table'))).toBe('1px')
    expect(borderWidth(part('switch-track'))).toBe('2px')
  })
})
