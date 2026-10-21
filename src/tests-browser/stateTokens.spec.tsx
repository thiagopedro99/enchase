import { render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import { Alert } from '@components/common/Alert/index.tsx'
import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { Input } from '@components/common/Input/index.tsx'
import { Switch } from '@components/common/Switch/index.tsx'
import { Table } from '@components/common/Table/index.tsx'
import { pressMouse, releaseMouse } from './pointer.ts'
import { renderInBrowser } from './harness.tsx'
import { waitForSettled } from './settle.ts'

import type { CSSProperties, ReactNode } from 'react'

const columns = [{ key: 'name', header: 'Name' }]

const rows = [{ name: 'Ana' }]

const scoped = (style: Record<string, string>, children: ReactNode) => <div style={style as CSSProperties}>{children}</div>

const part = (name: string) => document.body.querySelector(`[data-slot="${name}"]`) as HTMLElement

const alphaOf = (color: string) => {
  const match = /(?:\/|,)\s*([0-9]*\.?[0-9]+)\s*\)/.exec(color)

  return match ? Number(match[1]) : 1
}

const shadowOf = (value: string) => ({ alpha: alphaOf(value), spread: Number([...value.matchAll(/(-?[0-9]*\.?[0-9]+)px/g)][3]?.[1]) })

const alertWithClose = <Alert onClose={() => undefined}>Saved</Alert>

afterEach(async () => {
  await releaseMouse()
})

describe('the hover layer from the tokens', () => {
  it('lays 8% of its own color over a hovered close button', async () => {
    renderInBrowser(alertWithClose)
    await userEvent.hover(part('alert-close'))
    await waitForSettled(() => part('alert-close'))

    expect(alphaOf(getComputedStyle(part('alert-close')).backgroundColor)).toBeCloseTo(0.08, 3)
  })

  it('takes the strength of the layer from the hover token set on a container', async () => {
    renderInBrowser(scoped({ '--enchase-state-hover': '0.5' }, alertWithClose))
    await userEvent.hover(part('alert-close'))
    await waitForSettled(() => part('alert-close'))

    expect(alphaOf(getComputedStyle(part('alert-close')).backgroundColor)).toBeCloseTo(0.5, 3)
  })

  it('keeps the 8% layer when a theme written before the tokens does not have them', async () => {
    render(alertWithClose)
    await userEvent.hover(part('alert-close'))
    await waitForSettled(() => part('alert-close'))

    expect(alphaOf(getComputedStyle(part('alert-close')).backgroundColor)).toBeCloseTo(0.08, 3)
  })

  it('lays 6% over a hovered row of the table, from its own token', async () => {
    renderInBrowser(<Table columns={columns} rows={rows} />)
    const row = document.querySelector('tbody tr') as HTMLElement

    await userEvent.hover(row)
    await waitForSettled(() => row)
    expect(alphaOf(getComputedStyle(row).backgroundColor)).toBeCloseTo(0.06, 3)
  })

  it('moves the layer of the row with the row hover token', async () => {
    renderInBrowser(scoped({ '--enchase-state-row-hover': '0.4' }, <Table columns={columns} rows={rows} />))
    const row = document.querySelector('tbody tr') as HTMLElement

    await userEvent.hover(row)
    await waitForSettled(() => row)
    expect(alphaOf(getComputedStyle(row).backgroundColor)).toBeCloseTo(0.4, 3)
  })
})

describe('the pressed layer from the tokens', () => {
  it('lays 10% over a pressed close button, the strength of the pressed token', async () => {
    renderInBrowser(alertWithClose)
    await pressMouse('[data-slot="alert-close"]')
    await waitForSettled(() => part('alert-close'))

    expect(alphaOf(getComputedStyle(part('alert-close')).backgroundColor)).toBeCloseTo(0.1, 3)
  })

  it('takes the strength of the pressed layer from the pressed token set on a container', async () => {
    renderInBrowser(scoped({ '--enchase-state-pressed': '0.4' }, alertWithClose))
    await pressMouse('[data-slot="alert-close"]')
    await waitForSettled(() => part('alert-close'))

    expect(alphaOf(getComputedStyle(part('alert-close')).backgroundColor)).toBeCloseTo(0.4, 3)
  })

  it('lays the same pressed layer around the thumb of a pressed switch', async () => {
    renderInBrowser(<Switch label="Alerts" />)
    await pressMouse('[data-slot="switch"]')
    await waitForSettled(() => part('switch'))

    expect(shadowOf(getComputedStyle(part('switch-thumb')).boxShadow).alpha).toBeCloseTo(0.1, 3)
  })
})

describe('the disabled layers from the tokens', () => {
  it('dims the outline of a disabled field to 12% and the track of a disabled switch to 38%', () => {
    renderInBrowser(
      <>
        <Input label="Name" disabled />
        <Switch label="Alerts" disabled />
      </>
    )

    expect(alphaOf(getComputedStyle(part('input-outline')).borderTopColor)).toBeCloseTo(0.12, 3)
    expect(alphaOf(getComputedStyle(part('switch-track')).borderTopColor)).toBeCloseTo(0.38, 3)
  })

  it('takes both strengths from the disabled tokens set on a container', () => {
    renderInBrowser(
      scoped(
        { '--enchase-state-disabled-container': '0.5', '--enchase-state-disabled-content': '0.7' },
        <>
          <Input label="Name" disabled />
          <Switch label="Alerts" disabled />
        </>
      )
    )

    expect(alphaOf(getComputedStyle(part('input-outline')).borderTopColor)).toBeCloseTo(0.5, 3)
    expect(alphaOf(getComputedStyle(part('switch-track')).borderTopColor)).toBeCloseTo(0.7, 3)
  })
})

describe('the halo of the selection controls from the tokens', () => {
  it('surrounds a hovered checkbox with a 10px halo and the thumb of a hovered switch with an 8px one', async () => {
    renderInBrowser(
      <>
        <Checkbox label="Terms" />
        <Switch label="Alerts" />
      </>
    )

    await userEvent.hover(part('checkbox'))
    await waitForSettled(() => part('checkbox'))
    expect(shadowOf(getComputedStyle(part('checkbox-box')).boxShadow)).toMatchObject({ spread: 10 })

    await userEvent.hover(part('switch'))
    await waitForSettled(() => part('switch'))
    expect(shadowOf(getComputedStyle(part('switch-thumb')).boxShadow)).toMatchObject({ spread: 8 })
  })

  it('takes the size of each halo from its token, and no halo at all from a size of zero', async () => {
    renderInBrowser(
      scoped(
        { '--enchase-halo-size': '4px', '--enchase-halo-size-switch': '0px' },
        <>
          <Checkbox label="Terms" />
          <Switch label="Alerts" />
        </>
      )
    )

    await userEvent.hover(part('checkbox'))
    await waitForSettled(() => part('checkbox'))
    expect(shadowOf(getComputedStyle(part('checkbox-box')).boxShadow).spread).toBe(4)

    await userEvent.hover(part('switch'))
    await waitForSettled(() => part('switch'))
    expect(shadowOf(getComputedStyle(part('switch-thumb')).boxShadow).spread).toBe(0)
  })
})
