import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { axe } from '@tests/axe.ts'

import type { RequiredContractAdapter } from './types.ts'

const placements = ['floating', 'stacked', 'start'] as const

export const describeRequiredContract = ({ name, slot, control, role, render: ui }: RequiredContractAdapter) => {
  describe(`${name} · contrato do campo obrigatório`, () => {
    const wrapper = () => document.querySelector(`[data-slot="${slot}"]`) as HTMLElement

    const marks = () => wrapper().querySelectorAll(`[data-slot="${slot}-required"]`)

    const legendMarks = () => wrapper().querySelectorAll('legend span > span')

    it('draws no mark by default, and none when it is required but has no label, and still passes the native attribute to the control', () => {
      const { unmount } = render(ui())

      expect(marks()).toHaveLength(0)
      expect(legendMarks()).toHaveLength(0)
      expect(document.querySelector(control)).not.toBeRequired()
      unmount()

      const withoutLabel = render(ui({ required: true, label: undefined }))

      expect(marks()).toHaveLength(0)
      expect(legendMarks()).toHaveLength(0)
      expect(document.querySelector(control)).toBeRequired()
      withoutLabel.unmount()
      render(ui({ required: false }))

      expect(marks()).toHaveLength(0)
      expect(document.querySelector(control)).not.toBeRequired()
    })

    it.each(placements)('draws one mark after the text of the label in the %s placement, hidden from assistive technologies, and keeps the native required and the accessible name', (labelPlacement) => {
      render(ui({ required: true, labelPlacement }))

      const label = screen.getByText('Name', { selector: 'label' })
      const field = document.querySelector(control) as HTMLElement
      const [mark] = marks()

      expect(marks()).toHaveLength(1)
      expect(mark).toHaveAttribute('aria-hidden', 'true')
      expect(mark.parentElement).toBe(label)
      expect(label.lastElementChild).toBe(mark)
      expect(mark.previousSibling?.textContent).toBe('Name')
      expect(field).toBeRequired()
      expect(field).toHaveAccessibleName('Name')
      expect(screen.getByLabelText('Name')).toBe(field)
      expect(screen.getByRole(role, { name: 'Name' })).toBe(field)
    })

    it('draws the mark in the legend of the outline too when the label floats, so that the notch is as wide as the label', () => {
      render(ui({ required: true, labelPlacement: 'floating' }))

      expect(legendMarks()).toHaveLength(1)
      expect(wrapper().querySelector('legend span')).toHaveTextContent('Name')
      expect(wrapper().querySelector('legend span')?.lastElementChild).toBe(legendMarks()[0])
    })

    it.each(['stacked', 'start'] as const)('leaves the legend without a mark when the label is %s, because there is no notch', (labelPlacement) => {
      render(ui({ required: true, labelPlacement }))

      expect(legendMarks()).toHaveLength(0)
    })

    it('keeps the mark with an error or a helper text, and the error still replaces the helper text', () => {
      const { unmount } = render(ui({ required: true, error: 'Wrong' }))

      expect(marks()).toHaveLength(1)
      expect(screen.getByRole('alert')).toHaveTextContent('Wrong')
      unmount()
      render(ui({ required: true, helperText: 'Help' }))

      expect(marks()).toHaveLength(1)
      expect(document.querySelector(control)).toHaveAccessibleDescription('Help')
    })

    it.each(placements)('has no axe violations with the mark in the %s placement', async (labelPlacement) => {
      const { container } = render(<form>{ui({ required: true, labelPlacement, helperText: 'Help' })}</form>)

      expect(await axe(container)).toHaveNoViolations()
    })
  })
}
