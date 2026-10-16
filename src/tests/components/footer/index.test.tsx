import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import UIProvider from '@components/uiProvider/index.tsx'
import Footer from '@components/footer/index.tsx'
import { axe } from '@tests/axe.ts'

describe('Footer', () => {
  it('is a contentinfo landmark with only the year when nothing else is given', () => {
    render(<Footer year={2030} />)

    expect(screen.getByRole('contentinfo')).toHaveAttribute('data-slot', 'footer')
    expect(screen.getByRole('contentinfo')).toHaveTextContent(/^© 2030$/)
  })

  it('joins the company and the notice after the year', () => {
    render(<Footer year={2030} companyName="Acme" notice="Todos os direitos reservados." />)

    expect(screen.getByRole('contentinfo')).toHaveTextContent('© 2030 Acme. Todos os direitos reservados.')
  })

  it.each([
    ['Acme', '© 2030 Acme. Todos os direitos reservados.'],
    ['Acme Inc.', '© 2030 Acme Inc. Todos os direitos reservados.'],
    ['Acme!', '© 2030 Acme! Todos os direitos reservados.']
  ])('ends the company name "%s" with a single punctuation mark', (companyName, expected) => {
    render(<Footer year={2030} companyName={companyName} notice="Todos os direitos reservados." />)

    expect(screen.getByRole('contentinfo').textContent).toBe(expected)
  })

  it('lists the links with slots', () => {
    render(<Footer links={[{ label: 'Termos', href: '/termos' }]} />)

    expect(screen.getByRole('link', { name: 'Termos' })).toHaveAttribute('data-slot', 'footer-link')
  })

  it('navigates through the provider on a plain click of a link', () => {
    const navigate = vi.fn()
    render(
      <UIProvider navigate={navigate}>
        <Footer links={[{ label: 'Termos', href: '/termos' }]} />
      </UIProvider>
    )

    const notPrevented = fireEvent.click(screen.getByRole('link', { name: 'Termos' }))

    expect(navigate).toHaveBeenCalledWith('/termos')
    expect(notPrevented).toBe(false)
  })

  it('leaves external links to the browser', () => {
    const navigate = vi.fn()
    render(
      <UIProvider navigate={navigate}>
        <Footer links={[{ label: 'GitHub', href: 'https://github.com/thiagopedro99/enchase' }]} />
      </UIProvider>
    )

    const notPrevented = fireEvent.click(screen.getByRole('link', { name: 'GitHub' }))

    expect(navigate).not.toHaveBeenCalled()
    expect(notPrevented).toBe(true)
  })

  it('keeps the caller className, style and attributes', () => {
    render(<Footer className="mine" style={{ color: 'red' }} id="rodape" />)
    const footer = screen.getByRole('contentinfo')

    expect(footer.className.split(' ').at(-1)).toBe('mine')
    expect(footer).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    expect(footer).toHaveAttribute('id', 'rodape')
  })

  it('has no axe violations', async () => {
    const { container } = render(<Footer links={[{ label: 'Termos', href: '/termos' }]} />)

    expect(await axe(container)).toHaveNoViolations()
  })
})
