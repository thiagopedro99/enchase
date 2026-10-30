import { afterEach, describe, expect, it } from 'vitest'
import { userEvent } from 'vitest/browser'

import Checkbox from '@components/common/Checkbox/index.tsx'
import RadioGroup from '@components/common/RadioGroup/index.tsx'
import SegmentedControl from '@components/common/SegmentedControl/index.tsx'
import Slider from '@components/common/Slider/index.tsx'
import Switch from '@components/common/Switch/index.tsx'
import { renderInBrowser } from '../support/harness.tsx'
import { at, becomes, hooked, onRoot, part, parts } from '../support/hookProbes.ts'
import { parkMouse, pressMouse, releaseMouse } from '../support/pointer.ts'
import { waitForSettled } from '../support/settle.ts'

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

const hover = async (target: Element) => {
  await userEvent.hover(target)
  await expect.poll(() => target.matches(':hover')).toBe(true)
  await waitForSettled(() => target)
}

const leave = async (target: Element) => {
  await parkMouse()
  await expect.poll(() => target.matches(':hover')).toBe(false)
  await waitForSettled(() => target)
}

describe('the track of the switch under the pointer from the hooks', () => {
  const track = (index: number) => getComputedStyle(part('switch-track', index)).backgroundColor

  const switches = (
    <>
      <Switch label="Off" />
      <Switch label="On" defaultChecked />
      <Switch label="Locked" disabled />
      <Switch label="Locked on" disabled defaultChecked />
    </>
  )

  it('keeps the track under the pointer as it is at rest when no hook is set, off, on and disabled', async () => {
    renderInBrowser(switches, 'auto')
    const rest = [0, 1, 2, 3].map(track)

    for (const index of [0, 1, 2, 3]) {
      await hover(part('switch', index))

      expect(track(index)).toBe(rest[index])
    }

    expect(rest.slice(0, 2)).toEqual([role('surface-container-high'), role('primary')])
  })

  it('takes the track of an off switch under the pointer from its hook, gives it back at rest when the pointer leaves, and leaves an on switch its own', async () => {
    onRoot({ '--enchase-switch-track-background-hover': 'rgb(1, 2, 3)' })
    renderInBrowser(switches, 'auto')
    const rest = [track(0), track(1)]

    await hover(part('switch', 0))
    expect(track(0)).toBe('rgb(1, 2, 3)')
    await leave(part('switch', 0))
    expect(track(0)).toBe(rest[0])
    await hover(part('switch', 1))
    expect(track(1)).toBe(rest[1])
  })

  it('takes the track of an on switch under the pointer from the hook of the on state, and leaves an off switch its own', async () => {
    onRoot({ '--enchase-switch-track-background-checked-hover': 'rgb(4, 5, 6)' })
    renderInBrowser(switches, 'auto')
    const rest = [track(0), track(1)]

    await hover(part('switch', 1))
    expect(track(1)).toBe('rgb(4, 5, 6)')
    await leave(part('switch', 1))
    expect(track(1)).toBe(rest[1])
    await hover(part('switch', 0))
    expect(track(0)).toBe(rest[0])
  })

  it('follows the hooks of the track at rest when the hooks of the hover are not set, and lets the hooks of the hover win over them', async () => {
    onRoot({ '--enchase-switch-track-background': 'rgb(1, 2, 3)', '--enchase-switch-track-background-checked': 'rgb(4, 5, 6)' })
    renderInBrowser(switches, 'auto')

    await hover(part('switch', 0))
    expect(track(0)).toBe('rgb(1, 2, 3)')
    await hover(part('switch', 1))
    expect(track(1)).toBe('rgb(4, 5, 6)')
    onRoot({ '--enchase-switch-track-background-hover': 'rgb(7, 8, 9)', '--enchase-switch-track-background-checked-hover': 'rgb(10, 11, 12)' })
    await waitForSettled(() => part('switch', 1))

    expect(track(1)).toBe('rgb(10, 11, 12)')
    await hover(part('switch', 0))
    expect(track(0)).toBe('rgb(7, 8, 9)')
  })

  it('keeps the track of a disabled switch, off and on, whatever the hooks of the hover say', async () => {
    onRoot({ '--enchase-switch-track-background-hover': 'rgb(1, 2, 3)', '--enchase-switch-track-background-checked-hover': 'rgb(4, 5, 6)' })
    renderInBrowser(switches, 'auto')
    const rest = [track(2), track(3)]

    for (const index of [2, 3]) {
      await hover(part('switch', index))

      expect(track(index)).toBe(rest[index - 2])
    }
  })
})

describe('the fill of the box of the checkbox under the pointer from the hook', () => {
  const fill = (index: number) => getComputedStyle(part('checkbox-box', index)).backgroundColor

  const edge = (index: number) => getComputedStyle(part('checkbox-box', index)).borderTopColor

  const boxes = (
    <>
      <Checkbox label="Off" />
      <Checkbox label="On" defaultChecked />
      <Checkbox label="Mixed" indeterminate />
      <Checkbox label="Locked on" disabled defaultChecked />
    </>
  )

  it('keeps the fill and the border of the box under the pointer as they are at rest when no hook is set', async () => {
    renderInBrowser(boxes, 'auto')
    const rest = [0, 1, 2, 3].map((index) => [fill(index), edge(index)])

    for (const index of [0, 1, 2, 3]) {
      await hover(part('checkbox', index))

      expect([fill(index), edge(index)]).toEqual(rest[index])
    }

    expect(rest.slice(1, 3)).toEqual([
      [role('primary'), role('primary')],
      [role('primary'), role('primary')]
    ])
  })

  it('takes the fill of a checked box and of a mixed one under the pointer from its hook, keeps their border, and leaves the unchecked and the disabled boxes their own', async () => {
    onRoot({ '--enchase-checkbox-box-background-checked-hover': 'rgb(1, 2, 3)' })
    renderInBrowser(boxes, 'auto')
    const rest = [0, 1, 2, 3].map((index) => [fill(index), edge(index)])

    for (const index of [0, 1, 2, 3]) {
      await hover(part('checkbox', index))

      expect([fill(index), edge(index)]).toEqual(index === 1 || index === 2 ? ['rgb(1, 2, 3)', rest[index][1]] : rest[index])
    }
  })

  it('gives the fill at rest back when the pointer leaves', async () => {
    onRoot({ '--enchase-checkbox-box-background-checked-hover': 'rgb(1, 2, 3)' })
    renderInBrowser(boxes, 'auto')
    const rest = fill(1)

    await hover(part('checkbox', 1))
    await leave(part('checkbox', 1))

    expect(fill(1)).toBe(rest)
  })

  it('follows the fill of the checked box at rest when the hook of the hover is not set', async () => {
    onRoot({ '--enchase-checkbox-box-background-checked': 'rgb(4, 5, 6)' })
    renderInBrowser(boxes, 'auto')

    for (const index of [1, 2]) {
      await hover(part('checkbox', index))

      expect(fill(index)).toBe('rgb(4, 5, 6)')
    }
  })
})

describe('the circle of the radio under the pointer from the hooks', () => {
  const options = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' }
  ]

  const groups = (
    <>
      <RadioGroup label="Plan" options={options} defaultValue="a" />
      <RadioGroup label="Invalid" options={options} error="Pick one" />
      <RadioGroup label="Locked" options={options} defaultValue="a" disabled />
    </>
  )

  const look = (index: number) => {
    const circle = getComputedStyle(part('radio-group-control', index))

    return [circle.borderTopColor, circle.backgroundColor]
  }

  it('keeps the border and the fill of the circle under the pointer as they are at rest when no hook is set, also in an invalid group and a disabled one', async () => {
    renderInBrowser(groups, 'auto')
    const rest = [0, 1, 2, 3, 4, 5].map(look)

    for (const index of [0, 1, 2, 3, 4, 5]) {
      await hover(part('radio-group-option', index))

      expect(look(index)).toEqual(rest[index])
    }

    expect(rest.slice(0, 4)).toEqual([
      [role('primary'), 'rgba(0, 0, 0, 0)'],
      [role('border-strong'), 'rgba(0, 0, 0, 0)'],
      [role('error'), 'rgba(0, 0, 0, 0)'],
      [role('error'), 'rgba(0, 0, 0, 0)']
    ])
  })

  it('takes the border of an unchecked circle and the fill of a checked one under the pointer from their hooks, and leaves the rest alone', async () => {
    onRoot({ '--enchase-radio-group-control-border-color-hover': 'rgb(1, 2, 3)', '--enchase-radio-group-control-background-checked-hover': 'rgb(4, 5, 6)' })
    renderInBrowser(groups, 'auto')
    const rest = [0, 1, 2, 3, 4, 5].map(look)
    const expected = [[rest[0][0], 'rgb(4, 5, 6)'], ['rgb(1, 2, 3)', rest[1][1]], rest[2], rest[3], rest[4], rest[5]]

    for (const index of [0, 1, 2, 3, 4, 5]) {
      await hover(part('radio-group-option', index))

      expect(look(index)).toEqual(expected[index])
    }
  })

  it('follows the hooks of the circle at rest when the hooks of the hover are not set', async () => {
    onRoot({ '--enchase-radio-group-control-border-color': 'rgb(7, 8, 9)', '--enchase-radio-group-control-background-checked': 'rgb(10, 11, 12)' })
    renderInBrowser(groups, 'auto')

    await hover(part('radio-group-option', 1))
    expect(look(1)[0]).toBe('rgb(7, 8, 9)')
    await hover(part('radio-group-option', 0))
    expect(look(0)[1]).toBe('rgb(10, 11, 12)')
  })
})

describe('the thumb and the range of the slider under the pointer from the hooks', () => {
  const slider = <Slider label="Volume" defaultValue={40} />

  const locked = <Slider label="Locked" defaultValue={40} disabled />

  const look = () => [getComputedStyle(part('slider-thumb')).borderTopWidth, getComputedStyle(part('slider-range')).backgroundColor]

  const press = async () => {
    await pressMouse('[data-slot="slider-control"]')
    await waitForSettled(() => part('slider'))
  }

  it('keeps the border of the thumb and the fill of the range under the pointer and while the mouse is down as they are at rest when no hook is set', async () => {
    renderInBrowser(slider, 'auto')
    const rest = look()

    await hover(part('slider-control'))
    expect(look()).toEqual(rest)
    await press()
    expect(look()).toEqual(rest)
    expect(rest).toEqual(['2px', role('primary')])
  })

  it('takes the width of the border of the thumb and the fill of the range under the pointer from their hooks, and gives the look at rest back when the pointer leaves', async () => {
    onRoot({ '--enchase-slider-thumb-border-width-hover': '4px', '--enchase-slider-range-background-hover': 'rgb(1, 2, 3)' })
    renderInBrowser(slider, 'auto')
    const rest = look()

    await hover(part('slider-control'))
    expect(look()).toEqual(['4px', 'rgb(1, 2, 3)'])
    await leave(part('slider-control'))
    expect(look()).toEqual(rest)
  })

  it('takes the width of the border of the thumb while the mouse is down from its hook, which wins over the hook of the hover, and keeps the fill of the range of the hover', async () => {
    onRoot({ '--enchase-slider-thumb-border-width-hover': '4px', '--enchase-slider-thumb-border-width-active': '6px', '--enchase-slider-range-background-hover': 'rgb(1, 2, 3)' })
    renderInBrowser(slider, 'auto')

    await hover(part('slider-control'))
    expect(look()).toEqual(['4px', 'rgb(1, 2, 3)'])
    await press()

    expect(look()).toEqual(['6px', 'rgb(1, 2, 3)'])
  })

  it('follows the hooks of the thumb and of the range at rest when the hooks of the hover are not set', async () => {
    onRoot({ '--enchase-slider-thumb-border-width': '3px', '--enchase-slider-range-background': 'rgb(4, 5, 6)' })
    renderInBrowser(slider, 'auto')

    await hover(part('slider-control'))
    expect(look()).toEqual(['3px', 'rgb(4, 5, 6)'])
    await press()

    expect(look()).toEqual(['3px', 'rgb(4, 5, 6)'])
  })

  it('keeps a disabled slider as it is under the pointer and while the mouse is down, whatever the hooks say', async () => {
    onRoot({ '--enchase-slider-thumb-border-width-hover': '4px', '--enchase-slider-thumb-border-width-active': '6px', '--enchase-slider-range-background-hover': 'rgb(1, 2, 3)' })
    renderInBrowser(locked, 'auto')
    const rest = look()

    await hover(part('slider-control'))
    expect(look()).toEqual(rest)
    await press()

    expect(look()).toEqual(rest)
  })
})
