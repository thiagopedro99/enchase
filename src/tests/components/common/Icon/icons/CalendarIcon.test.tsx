import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CalendarIcon } from '@components/common/Icon/icons/CalendarIcon.tsx'

const drawn = () => {
  const { container } = render(<CalendarIcon />)
  const box = container.querySelector('rect')

  return {
    box: ['x', 'y', 'width', 'height', 'rx'].map((name) => box?.getAttribute(name)),
    strokes: Array.from(container.querySelectorAll('path'), (path) => path.getAttribute('d'))
  }
}

describe('CalendarIcon', () => {
  it('draws its own geometry: a box of 18 by 16 with corners of 3, and not the 18 by 18 box with corners of 2 of the icon sets', () => {
    expect(drawn().box).toEqual(['3', '5', '18', '16', '3'])
  })

  it('draws the two pins from 3 to 7 and the line of the header at 11', () => {
    expect(drawn().strokes).toEqual(['M8 3v4', 'M16 3v4', 'M3 11h18'])
  })
})
