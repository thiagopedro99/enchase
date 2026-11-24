import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Checkbox } from '@components/common/Checkbox/index.tsx'
import { RadioGroup } from '@components/common/RadioGroup/index.tsx'
import { Switch } from '@components/common/Switch/index.tsx'
import { renderInBrowser } from '../support/harness.tsx'
import { waitForSettled } from '../support/settle.ts'

import type { CSSProperties, ReactNode } from 'react'

const scoped = (style: Record<string, string>, children: ReactNode) => <div style={style as CSSProperties}>{children}</div>

const part = (name: string) => document.body.querySelector(`[data-slot="${name}"]`) as HTMLElement

const dimensions = (element: Element, pseudo?: string) => {
  const style = getComputedStyle(element, pseudo)

  return { width: style.width, height: style.height }
}

const size = (value: string) => Math.abs(parseFloat(value))

const glyph = () => (part('checkbox-box').firstElementChild as Element)

const dot = () => (part('radio-group-control').firstElementChild as Element)

const translation = (element: Element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).m41

const scale = (element: Element) => new DOMMatrixReadOnly(getComputedStyle(element).transform).a

const options = [{ value: 'a', label: 'A' }]

const radio = <RadioGroup label="Plan" options={options} defaultValue="a" />

describe('the geometry of the checkbox from the hooks', () => {
  it('keeps the 16px box with its check and a 2px stroke', () => {
    renderInBrowser(<Checkbox label="Terms" defaultChecked />)

    const style = getComputedStyle(glyph(), '::after')

    expect(dimensions(part('checkbox-box'))).toEqual({ width: '16px', height: '16px' })
    expect(size(style.width)).toBeCloseTo(4.44, 1)
    expect(size(style.height)).toBeCloseTo(8.88, 1)
    expect([style.borderRightWidth, style.borderBottomWidth]).toEqual(['2px', '2px'])
    expect(size(style.marginTop)).toBeCloseTo(1.77, 1)
  })

  it('takes the size of the box from the hook and draws the check in proportion', () => {
    renderInBrowser(scoped({ '--enchase-checkbox-box-size': '36px' }, <Checkbox label="Terms" defaultChecked />))

    expect(dimensions(part('checkbox-box'))).toEqual({ width: '36px', height: '36px' })
    expect(dimensions(glyph(), '::after')).toEqual({ width: '10px', height: '20px' })
    expect(getComputedStyle(glyph(), '::after').marginTop).toBe('-4px')
  })

  it('takes the stroke of the check from its own hook, leaving the box alone', () => {
    renderInBrowser(scoped({ '--enchase-checkbox-box-check-width': '3px' }, <Checkbox label="Terms" defaultChecked />))

    const style = getComputedStyle(glyph(), '::after')

    expect([style.borderRightWidth, style.borderBottomWidth]).toEqual(['3px', '3px'])
    expect(dimensions(part('checkbox-box'))).toEqual({ width: '16px', height: '16px' })
  })

  it('keeps the 18px box when a theme written before the hooks does not have them', () => {
    render(<Checkbox label="Terms" defaultChecked />)

    expect(dimensions(part('checkbox-box'))).toEqual({ width: '18px', height: '18px' })
  })
})

describe('the geometry of the radio from the hooks', () => {
  it('keeps the 16px control with an 8px dot', () => {
    renderInBrowser(radio)

    expect(dimensions(part('radio-group-control'))).toEqual({ width: '16px', height: '16px' })
    expect(dimensions(dot())).toEqual({ width: '8px', height: '8px' })
    expect(getComputedStyle(dot()).borderTopWidth).toBe('4px')
  })

  it('takes the size of the control from the hook and keeps the dot at half of it', () => {
    renderInBrowser(scoped({ '--enchase-radio-group-control-size': '40px' }, radio))

    expect(dimensions(part('radio-group-control'))).toEqual({ width: '40px', height: '40px' })
    expect(dimensions(dot())).toEqual({ width: '20px', height: '20px' })
    expect(getComputedStyle(dot()).borderTopWidth).toBe('10px')
  })

  it('takes the size of the dot from its own hook, leaving the control alone', () => {
    renderInBrowser(scoped({ '--enchase-radio-group-control-dot-size': '8px' }, radio))

    expect(dimensions(part('radio-group-control'))).toEqual({ width: '16px', height: '16px' })
    expect(dimensions(dot())).toEqual({ width: '8px', height: '8px' })
    expect(getComputedStyle(dot()).borderTopWidth).toBe('4px')
  })

  it('keeps the 20px control when a theme written before the hooks does not have them', () => {
    render(radio)

    expect(dimensions(part('radio-group-control'))).toEqual({ width: '20px', height: '20px' })
  })
})

describe('the geometry of the switch from the hooks', () => {
  it('keeps the 32px by 18.4px track, the 16px thumb flush with the edge and a 14px travel', async () => {
    renderInBrowser(<Switch label="Alerts" defaultChecked />)
    await waitForSettled(() => part('switch'))

    expect(dimensions(part('switch-track')).width).toBe('32px')
    expect(size(dimensions(part('switch-track')).height)).toBeCloseTo(18.39, 1)
    expect(dimensions(part('switch-thumb'))).toEqual({ width: '16px', height: '16px' })
    expect(part('switch-thumb').offsetLeft).toBe(0)
    expect(translation(part('switch-thumb'))).toBe(14)
  })

  it('keeps the thumb at full size while the switch is off, because the style asks for that scale', () => {
    renderInBrowser(<Switch label="Alerts" />)

    expect(scale(part('switch-thumb'))).toBe(1)
    expect(translation(part('switch-thumb'))).toBe(0)
  })

  it('stretches the travel with the width of the track', async () => {
    renderInBrowser(scoped({ '--enchase-switch-track-width': '100px' }, <Switch label="Alerts" defaultChecked />))
    await waitForSettled(() => part('switch'))

    expect(dimensions(part('switch-track')).width).toBe('100px')
    expect(translation(part('switch-thumb'))).toBe(82)
  })

  it('takes the height of the track from its hook', () => {
    renderInBrowser(scoped({ '--enchase-switch-track-height': '20px' }, <Switch label="Alerts" />))

    expect(dimensions(part('switch-track')).height).toBe('20px')
  })

  it('shortens the travel when the thumb is bigger or sits farther from the edge', async () => {
    renderInBrowser(scoped({ '--enchase-switch-thumb-size': '16px', '--enchase-switch-thumb-inset': '3px' }, <Switch label="Alerts" defaultChecked />))
    await waitForSettled(() => part('switch'))

    expect(dimensions(part('switch-thumb'))).toEqual({ width: '16px', height: '16px' })
    expect(part('switch-thumb').offsetLeft).toBe(3)
    expect(translation(part('switch-thumb'))).toBe(8)
  })

  it('takes the scale of the thumb while the switch is off from the hook, so a full size thumb is possible', () => {
    renderInBrowser(scoped({ '--enchase-switch-thumb-scale-off': '1' }, <Switch label="Alerts" />))

    expect(scale(part('switch-thumb'))).toBe(1)
  })

  it('moves the thumb the same distance the other way in a right to left page', async () => {
    renderInBrowser(
      <div dir="rtl">
        <Switch label="Alerts" defaultChecked />
      </div>
    )
    await waitForSettled(() => part('switch'))

    expect(translation(part('switch-thumb'))).toBe(-14)
  })

  it('keeps the 52px by 32px track when a theme written before the hooks does not have them', () => {
    render(<Switch label="Alerts" />)

    expect(dimensions(part('switch-track'))).toEqual({ width: '52px', height: '32px' })
  })
})
