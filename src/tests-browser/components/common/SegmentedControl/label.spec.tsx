import { afterEach, describe, expect, it } from 'vitest'

import { SegmentedControl } from '@components/common/SegmentedControl/index.tsx'
import { renderInBrowser } from '../../../support/harness.tsx'
import { at, hooked, part, parts, style } from '../../../support/hookProbes.ts'

const views = [
  { value: 'list', label: 'Lista' },
  { value: 'board', label: 'Quadro' },
  { value: 'calendar', label: 'Agenda' }
]

const longLabel = 'Como você prefere ver a lista de tarefas'

afterEach(() => {
  document.documentElement.removeAttribute('style')
  document.documentElement.removeAttribute('dir')
})

const rect = (name: string, index = 0) => part(name, index).getBoundingClientRect()

const box = (element: Element) => {
  const { width, height } = element.getBoundingClientRect()

  return [width, height]
}

describe('the label of the segmented control in a real browser', () => {
  it('sits above the group, at its start edge, with the space of the margin hook between them', () => {
    renderInBrowser(<SegmentedControl label="Visão" items={views} />)
    const label = rect('segmented-control-label')
    const group = rect('segmented-control')

    expect(Math.abs(label.bottom + 8 - group.top)).toBeLessThanOrEqual(0.5)
    expect(Math.abs(label.left - group.left)).toBeLessThanOrEqual(0.5)
  })

  it('has the typography of the legend of the radio group by default', () => {
    renderInBrowser(<SegmentedControl label="Visão" items={views} />)
    const label = style('segmented-control-label')

    expect(label.fontSize).toBe('16px')
    expect(label.fontWeight).toBe('500')
    expect(label.marginBlockEnd).toBe('8px')
  })

  it('does not change the box of the group, nor the width that the control takes', () => {
    renderInBrowser(
      <>
        <SegmentedControl label="Visão" items={views} />
        <SegmentedControl ariaLabel="Visão" items={views} />
      </>
    )
    const [labelled, bare] = parts('segmented-control')

    expect(box(labelled)).toEqual(box(bare))
    expect(Math.abs(rect('segmented-control-field').width - labelled.getBoundingClientRect().width)).toBeLessThanOrEqual(0.5)
  })

  it('grows to the width of the label when it is wider than the group, and the group keeps its size', () => {
    renderInBrowser(
      <>
        <SegmentedControl label={longLabel} items={views} />
        <SegmentedControl ariaLabel="Visão" items={views} />
      </>
    )
    const [labelled, bare] = parts('segmented-control')
    const field = rect('segmented-control-field')
    const label = rect('segmented-control-label')

    expect(field.width).toBeGreaterThan(labelled.getBoundingClientRect().width + 20)
    expect(Math.abs(field.width - label.width)).toBeLessThanOrEqual(0.5)
    expect(box(labelled)).toEqual(box(bare))
  })

  it('wraps a long label inside a narrow container instead of widening the control', () => {
    renderInBrowser(
      <div style={{ inlineSize: '220px' }}>
        <SegmentedControl label={longLabel} items={views} />
      </div>
    )
    const field = rect('segmented-control-field')
    const label = rect('segmented-control-label')

    expect(field.width).toBeLessThanOrEqual(220.5)
    expect(label.right).toBeLessThanOrEqual(field.right + 0.5)
    expect(label.height).toBeGreaterThan(24)
  })

  it('fills the container with fullWidth, wrapper and group alike, with the label at the start edge', () => {
    renderInBrowser(
      <div style={{ inlineSize: '360px' }}>
        <SegmentedControl label="Visão" items={views} fullWidth />
      </div>
    )
    const field = rect('segmented-control-field')
    const group = rect('segmented-control')
    const label = rect('segmented-control-label')

    expect(field.width).toBe(360)
    expect(group.width).toBe(360)
    expect(Math.abs(label.left - group.left)).toBeLessThanOrEqual(0.5)
  })

  it('puts the label at the start edge in a right-to-left page', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(
      <div style={{ inlineSize: '360px' }}>
        <SegmentedControl label="Visão" items={views} />
      </div>
    )
    const label = rect('segmented-control-label')
    const group = rect('segmented-control')

    expect(Math.abs(label.right - group.right)).toBeLessThanOrEqual(0.5)
    expect(label.bottom).toBeLessThanOrEqual(group.top)
  })

  it('puts the label at the start edge of a full width control in a right-to-left page', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    renderInBrowser(
      <div style={{ inlineSize: '360px' }}>
        <SegmentedControl label="Visão" items={views} fullWidth />
      </div>
    )
    const label = rect('segmented-control-label')
    const group = rect('segmented-control')

    expect(group.width).toBe(360)
    expect(Math.abs(label.right - group.right)).toBeLessThanOrEqual(0.5)
  })

  it('follows the hooks of the label', () => {
    hooked(
      [
        ['--enchase-segmented-control-label-font-size', '21px', at('segmented-control-label'), 'font-size'],
        ['--enchase-segmented-control-label-font-weight', '700', at('segmented-control-label'), 'font-weight'],
        ['--enchase-segmented-control-label-color', 'rgb(1, 2, 3)', at('segmented-control-label'), 'color'],
        ['--enchase-segmented-control-label-margin-block-end', '13px', at('segmented-control-label'), 'margin-block-end']
      ],
      <SegmentedControl label="Visão" items={views} />
    )
  })

  it('moves the group down by the margin of the hook', () => {
    document.documentElement.style.setProperty('--enchase-segmented-control-label-margin-block-end', '20px')
    renderInBrowser(<SegmentedControl label="Visão" items={views} />)

    expect(Math.abs(rect('segmented-control-label').bottom + 20 - rect('segmented-control').top)).toBeLessThanOrEqual(0.5)
  })
})
