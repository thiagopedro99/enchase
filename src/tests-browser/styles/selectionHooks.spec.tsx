import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import Checkbox from '@components/common/Checkbox/index.tsx'
import RadioGroup from '@components/common/RadioGroup/index.tsx'
import SegmentedControl from '@components/common/SegmentedControl/index.tsx'
import Switch from '@components/common/Switch/index.tsx'
import { renderInBrowser } from '../support/harness.tsx'
import { at, becomes, hooked, onRoot, part, parts } from '../support/hookProbes.ts'
import { pressMouse, releaseMouse } from '../support/pointer.ts'

afterEach(async () => {
  await releaseMouse()
  document.documentElement.removeAttribute('style')
})

const shadowOf = (value: string) => {
  const probe = document.createElement('span')

  probe.style.boxShadow = value
  document.body.append(probe)

  const computed = getComputedStyle(probe).boxShadow

  probe.remove()

  return computed
}

const halo = (color: 'text-primary' | 'primary', strength: number) => shadowOf(`0 0 0 0.5rem color-mix(in srgb, var(--enchase-color-${color}) ${strength}%, transparent)`)

const colorOf = (value: string) => {
  const probe = document.createElement('span')

  probe.style.color = value
  document.body.append(probe)

  const computed = getComputedStyle(probe).color

  probe.remove()

  return computed
}

const role = (name: string) => colorOf(`var(--enchase-color-${name})`)

const thumbShadow = (index = 0) => getComputedStyle(part('switch-thumb', index)).boxShadow

describe('the thumb of the switch from the hooks', () => {
  it('has no shadow on the thumb when no hook is set', () => {
    renderInBrowser(
      <>
        <Switch label="Off" />
        <Switch label="On" defaultChecked />
        <Switch label="Locked" disabled />
      </>
    )

    expect([0, 1, 2].map((index) => thumbShadow(index))).toEqual(['none', 'none', 'none'])
  })

  it('takes the shadow of the resting thumb from its hook, also while disabled', () => {
    hooked(
      [
        ['--enchase-switch-thumb-shadow', '0 2px 4px rgb(1, 2, 3)', at('switch-thumb', 0), 'box-shadow', /rgb\(1, 2, 3\)/],
        ['--enchase-switch-thumb-shadow', '0 2px 4px rgb(1, 2, 3)', at('switch-thumb', 1), 'box-shadow', /rgb\(1, 2, 3\)/]
      ],
      <>
        <Switch label="On" defaultChecked />
        <Switch label="Locked" disabled />
      </>
    )
  })

  it('draws the halo of the hover state under the pointer when no hook is set, 8% of the text color when off and of the primary color when on', async () => {
    renderInBrowser(
      <>
        <Switch label="Off" />
        <Switch label="On" defaultChecked />
      </>
    )

    await userEvent.hover(part('switch', 0))
    await becomes(at('switch-thumb', 0), 'box-shadow', halo('text-primary', 8))
    await userEvent.hover(part('switch', 1))
    await becomes(at('switch-thumb', 1), 'box-shadow', halo('primary', 8))
  })

  it('draws the halo of the pressed state while the mouse is down when no hook is set, 10% of the text color when off', async () => {
    renderInBrowser(<Switch label="Off" />)
    await pressMouse('[data-slot="switch"]')

    await becomes(at('switch-thumb'), 'box-shadow', halo('text-primary', 10))
  })

  it('draws the halo of the pressed state while the mouse is down when no hook is set, 10% of the primary color when on', async () => {
    renderInBrowser(<Switch label="On" defaultChecked />)
    await pressMouse('[data-slot="switch"]')

    await becomes(at('switch-thumb'), 'box-shadow', halo('primary', 10))
  })

  it('takes the shadow of the thumb under the pointer from the hover hook when off', async () => {
    onRoot({ '--enchase-switch-thumb-shadow-hover': '0 2px 4px rgb(1, 2, 3)' })
    renderInBrowser(<Switch label="Off" />)
    await userEvent.hover(part('switch'))

    await becomes(at('switch-thumb'), 'box-shadow', shadowOf('0 2px 4px rgb(1, 2, 3)'))
  })

  it('takes the shadow of the thumb under the pointer from the hover hook of the on state when on, and leaves the off state its halo', async () => {
    onRoot({ '--enchase-switch-thumb-shadow-checked-hover': '0 2px 4px rgb(4, 5, 6)' })
    renderInBrowser(
      <>
        <Switch label="Off" />
        <Switch label="On" defaultChecked />
      </>
    )
    await userEvent.hover(part('switch', 1))
    await becomes(at('switch-thumb', 1), 'box-shadow', shadowOf('0 2px 4px rgb(4, 5, 6)'))
    await userEvent.hover(part('switch', 0))
    await becomes(at('switch-thumb', 0), 'box-shadow', halo('text-primary', 8))
  })

  it('takes the shadow of the pressed thumb from the pressed hook when off', async () => {
    onRoot({ '--enchase-switch-thumb-shadow-active': '0 2px 4px rgb(7, 8, 9)' })
    renderInBrowser(<Switch label="Off" />)
    await pressMouse('[data-slot="switch"]')

    await becomes(at('switch-thumb'), 'box-shadow', shadowOf('0 2px 4px rgb(7, 8, 9)'))
  })

  it('takes the shadow of the pressed thumb from the pressed hook of the on state when on', async () => {
    onRoot({ '--enchase-switch-thumb-shadow-checked-active': '0 2px 4px rgb(10, 11, 12)' })
    renderInBrowser(<Switch label="On" defaultChecked />)
    await pressMouse('[data-slot="switch"]')

    await becomes(at('switch-thumb'), 'box-shadow', shadowOf('0 2px 4px rgb(10, 11, 12)'))
  })

  it('keeps one shadow on the thumb in every state when a style turns the halo off and gives each state the same shadow', async () => {
    const shadow = '0 2px 4px rgb(1, 2, 3)'

    onRoot({
      '--enchase-halo-size-switch': '0px',
      '--enchase-switch-thumb-shadow': shadow,
      '--enchase-switch-thumb-shadow-hover': shadow,
      '--enchase-switch-thumb-shadow-active': shadow,
      '--enchase-switch-thumb-shadow-checked-hover': shadow,
      '--enchase-switch-thumb-shadow-checked-active': shadow
    })
    renderInBrowser(<Switch label="Off" />)
    expect(thumbShadow()).toBe(shadowOf(shadow))

    await userEvent.hover(part('switch'))
    await becomes(at('switch-thumb'), 'box-shadow', shadowOf(shadow))
    await pressMouse('[data-slot="switch"]')
    await becomes(at('switch-thumb'), 'box-shadow', shadowOf(shadow))
  })
})

describe('the box of the checkbox from the hooks', () => {
  const box = (index = 0) => getComputedStyle(part('checkbox-box', index)).borderTopColor

  it('keeps the color of the border of the box under the pointer as it was at rest when no hook is set', async () => {
    renderInBrowser(<Checkbox label="Accept" />)
    const rest = box()

    await userEvent.hover(part('checkbox'))
    await becomes(at('checkbox-box'), 'border-top-color', rest)

    expect(rest).toBe(role('border-strong'))
  })

  it('takes the color of the border of an unchecked box under the pointer from its hook, and keeps the one at rest', async () => {
    onRoot({ '--enchase-checkbox-box-border-color-hover': 'rgb(1, 2, 3)' })
    renderInBrowser(<Checkbox label="Accept" />)
    expect(box()).toBe(role('border-strong'))

    await userEvent.hover(part('checkbox'))
    await becomes(at('checkbox-box'), 'border-top-color', 'rgb(1, 2, 3)')
  })

  it('follows the hook of the border at rest when the hook of the hover is not set', async () => {
    onRoot({ '--enchase-checkbox-box-border-color': 'rgb(4, 5, 6)' })
    renderInBrowser(<Checkbox label="Accept" />)
    expect(box()).toBe('rgb(4, 5, 6)')

    await userEvent.hover(part('checkbox'))
    await becomes(at('checkbox-box'), 'border-top-color', 'rgb(4, 5, 6)')
  })

  it('keeps the border of a checked, an indeterminate, an invalid and a disabled box under the pointer, whatever the hook says', async () => {
    onRoot({ '--enchase-checkbox-box-border-color-hover': 'rgb(1, 2, 3)' })
    renderInBrowser(
      <>
        <Checkbox label="Checked" defaultChecked />
        <Checkbox label="Mixed" indeterminate />
        <Checkbox label="Invalid" error="Accept to continue" />
        <Checkbox label="Locked" disabled />
      </>
    )
    const before = [0, 1, 2, 3].map((index) => box(index))

    for (const index of [0, 1, 2, 3]) {
      await userEvent.hover(part('checkbox', index))
      await becomes(at('checkbox-box', index), 'border-top-color', before[index])
    }

    expect(before.slice(0, 3)).toEqual([role('primary'), role('primary'), role('error')])
  })
})

describe('the circle of the radio from the hooks', () => {
  const options = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' }
  ]

  const background = (index: number) => getComputedStyle(part('radio-group-control', index)).backgroundColor

  it('keeps every circle transparent when no hook is set', () => {
    renderInBrowser(
      <>
        <RadioGroup label="Plan" options={options} defaultValue="a" />
        <RadioGroup label="Locked" options={options} defaultValue="a" disabled />
      </>
    )

    expect([0, 1, 2, 3].map(background)).toEqual(['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)'])
  })

  it('takes the background of the checked circle from its hook, and leaves the unchecked and the disabled circles transparent', () => {
    onRoot({ '--enchase-radio-group-control-background-checked': 'rgb(1, 2, 3)' })
    renderInBrowser(
      <>
        <RadioGroup label="Plan" options={options} defaultValue="a" />
        <RadioGroup label="Locked" options={options} defaultValue="a" disabled />
      </>
    )

    expect([0, 1, 2, 3].map(background)).toEqual(['rgb(1, 2, 3)', 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)'])
  })
})

describe('the segmented control from the hooks', () => {
  const items = [
    { value: 'a', label: 'List' },
    { value: 'b', label: 'Board' }
  ]

  const single = <SegmentedControl ariaLabel="View" items={items} defaultValue="a" />

  const several = <SegmentedControl ariaLabel="View" items={items} multiple defaultValue={['a']} />

  const paddings = () => {
    const style = getComputedStyle(part('segmented-control'))

    return [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft]
  }

  const corners = () => parts('segmented-control-item').map((item) => getComputedStyle(item).borderTopLeftRadius)

  const shadows = () => parts('segmented-control-item').map((item) => getComputedStyle(item).boxShadow)

  it('has no padding on the track, no corner on the items and no shadow when no hook is set', () => {
    renderInBrowser(single)

    expect(paddings()).toEqual(['0px', '0px', '0px', '0px'])
    expect(corners()).toEqual(['0px', '0px'])
    expect(shadows()).toEqual(['none', 'none'])
  })

  it('takes the padding of the track from its hook', () => {
    hooked(
      [
        ['--enchase-segmented-control-padding', '3px 5px', at('segmented-control'), 'padding-top', '3px'],
        ['--enchase-segmented-control-padding', '3px 5px', at('segmented-control'), 'padding-left', '5px']
      ],
      single
    )
  })

  it('takes the corner of the items from its hook', () => {
    onRoot({ '--enchase-segmented-control-item-radius': '6px' })
    renderInBrowser(single)

    expect(corners()).toEqual(['6px', '6px'])
  })

  it('takes the shadow of the selected item from its hook, and leaves the others without one', () => {
    onRoot({ '--enchase-segmented-control-item-shadow-selected': '0 0 0 3px rgb(1, 2, 3)' })
    renderInBrowser(single)

    expect(shadows()[0]).toBe(shadowOf('0 0 0 3px rgb(1, 2, 3)'))
    expect(shadows()[1]).toBe('none')
  })

  it('gives the shadow to a pressed item of a group with several choices too', () => {
    onRoot({ '--enchase-segmented-control-item-shadow-selected': '0 0 0 3px rgb(1, 2, 3)' })
    renderInBrowser(several)

    expect(shadows()).toEqual([shadowOf('0 0 0 3px rgb(1, 2, 3)'), 'none'])
  })
})
