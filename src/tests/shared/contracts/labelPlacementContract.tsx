import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ColorModeProvider } from '@components/colorMode/index.tsx'
import { shadcn } from '@styles/presets/shadcn.ts'

import type { LabelPlacementContractAdapter } from './types.ts'

export const describeLabelPlacementContract = ({ name, slot, control, placeholder, render: ui }: LabelPlacementContractAdapter) => {
  describe(`${name} · contrato do lugar do rótulo`, () => {
    const wrapper = () => document.querySelector(`[data-slot="${slot}"]`) as HTMLElement

    it('floats the label inside the field by default, with the notch drawn from its text', () => {
      render(ui())

      const field = document.querySelector(control) as HTMLElement
      const label = screen.getByText('Name', { selector: 'label' })

      expect(wrapper()).not.toHaveAttribute('data-label-placement')
      expect(field).toHaveAttribute('data-has-label')
      expect(wrapper().firstElementChild?.tagName).toBe('DIV')
      expect(label.parentElement).toBe(wrapper().firstElementChild)
      expect(wrapper().querySelector('legend span')).toHaveTextContent('Name')
    })

    it('puts the label above the field when it is stacked, with no notch and the placeholder visible', () => {
      render(ui('stacked'))

      const field = document.querySelector(control) as HTMLElement
      const label = screen.getByText('Name', { selector: 'label' })

      expect(wrapper()).toHaveAttribute('data-label-placement', 'stacked')
      expect(wrapper().firstElementChild).toBe(label)
      expect(field).not.toHaveAttribute('data-has-label')
      expect(wrapper().querySelector('fieldset')).not.toHaveAttribute('data-has-label')
      expect(wrapper().querySelector('legend span')).not.toHaveTextContent('Name')

      if (placeholder !== undefined) expect(field).toHaveAttribute('placeholder', placeholder)
    })

    it('keeps the label tied to the field in both placements', () => {
      const { unmount } = render(ui())

      expect(screen.getByLabelText('Name')).toBe(document.querySelector(control))
      unmount()
      render(ui('stacked'))

      expect(screen.getByLabelText('Name')).toBe(document.querySelector(control))
    })

    it('takes the stacked label from the shadcn style and lets the prop win', () => {
      const { unmount } = render(
        <ColorModeProvider storage={null} theme={{ style: shadcn }}>
          {ui()}
        </ColorModeProvider>
      )

      expect(wrapper()).toHaveAttribute('data-label-placement', 'stacked')
      unmount()
      render(
        <ColorModeProvider storage={null} theme={{ style: shadcn }}>
          {ui('floating')}
        </ColorModeProvider>
      )

      expect(wrapper()).not.toHaveAttribute('data-label-placement')
    })

    it('draws one label only, whichever the placement', () => {
      const { container } = render(<>{ui('stacked')}</>)

      expect(container.querySelectorAll('label')).toHaveLength(1)
    })
  })
}
