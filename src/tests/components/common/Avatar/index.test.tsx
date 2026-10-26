import { renderWithProviders } from '@tests/renderWithProviders.tsx'
import { fireEvent, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from '@tests/axe.ts'

import { Avatar } from '@components/common/Avatar/index.tsx'

const sizes = ['sm', 'md', 'lg'] as const

const image = () => document.querySelector('img') as HTMLImageElement

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Avatar', () => {
  it('shows the initials of the name when there is no image', () => {
    renderWithProviders(<Avatar name="Ana Souza" />)

    expect(screen.getByRole('img', { name: 'Ana Souza' })).toHaveTextContent('AS')
    expect(document.querySelector('img')).toBeNull()
  })

  it('is named after the name, whatever it shows', () => {
    renderWithProviders(<Avatar name="Ana Souza" src="/ana.png" />)

    expect(screen.getByRole('img', { name: 'Ana Souza' })).toHaveAttribute('data-slot', 'avatar')
    expect(image()).toHaveAttribute('alt', '')
  })

  it('has no role and hides its question mark from assistive technology without a name', () => {
    renderWithProviders(<Avatar data-testid="avatar" />)
    const avatar = screen.getByTestId('avatar')

    expect(avatar).not.toHaveAttribute('role')
    expect(avatar).not.toHaveAttribute('aria-label')
    expect(avatar).toHaveTextContent('?')
    expect(avatar.querySelector('[data-slot="avatar-fallback"]')).toHaveAttribute('aria-hidden', 'true')
  })

  it('shows the children instead of the initials', () => {
    renderWithProviders(
      <Avatar name="Acme Ltda">
        <svg data-testid="logo" aria-hidden="true" />
      </Avatar>
    )

    expect(screen.getByTestId('logo')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Acme Ltda' })).not.toHaveTextContent('AL')
  })

  it('draws the image over the initials and drops the initials once it loads', () => {
    renderWithProviders(<Avatar name="Ana Souza" src="/ana.png" data-testid="avatar" />)
    const avatar = screen.getByTestId('avatar')

    expect(avatar).toHaveAttribute('data-state', 'loading')
    expect(image()).toHaveAttribute('src', '/ana.png')
    expect(avatar).toHaveTextContent('AS')

    fireEvent.load(image())

    expect(avatar).toHaveAttribute('data-state', 'loaded')
    expect(avatar).not.toHaveTextContent('AS')
    expect(image()).toBeInTheDocument()
  })

  it('goes back to the initials when the image fails', () => {
    renderWithProviders(<Avatar name="Ana Souza" src="/missing.png" data-testid="avatar" />)

    fireEvent.error(image())

    expect(document.querySelector('img')).toBeNull()
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-state', 'fallback')
    expect(screen.getByTestId('avatar')).toHaveTextContent('AS')
  })

  it('waits for the new image when the src changes, after a failure or a load', () => {
    const { rerender } = renderWithProviders(<Avatar name="Ana Souza" src="/one.png" data-testid="avatar" />)

    fireEvent.error(image())
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-state', 'fallback')

    rerender(<Avatar name="Ana Souza" src="/two.png" data-testid="avatar" />)

    expect(screen.getByTestId('avatar')).toHaveAttribute('data-state', 'loading')
    expect(image()).toHaveAttribute('src', '/two.png')

    fireEvent.load(image())
    expect(screen.getByTestId('avatar')).toHaveAttribute('data-state', 'loaded')

    rerender(<Avatar name="Ana Souza" src="/three.png" data-testid="avatar" />)

    expect(screen.getByTestId('avatar')).toHaveAttribute('data-state', 'loading')
  })

  it('has the state of an image that finished loading before the page was hydrated', () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(96)
    renderWithProviders(<Avatar name="Ana Souza" src="/ana.png" data-testid="avatar" />)

    expect(screen.getByTestId('avatar')).toHaveAttribute('data-state', 'loaded')
  })

  it('has the state of an image that failed before the page was hydrated', () => {
    vi.spyOn(HTMLImageElement.prototype, 'complete', 'get').mockReturnValue(true)
    vi.spyOn(HTMLImageElement.prototype, 'naturalWidth', 'get').mockReturnValue(0)
    renderWithProviders(<Avatar name="Ana Souza" src="/missing.png" data-testid="avatar" />)

    expect(screen.getByTestId('avatar')).toHaveAttribute('data-state', 'fallback')
    expect(document.querySelector('img')).toBeNull()
  })

  it('is in the fallback state without an image', () => {
    renderWithProviders(<Avatar name="Ana Souza" data-testid="avatar" />)

    expect(screen.getByTestId('avatar')).toHaveAttribute('data-state', 'fallback')
  })

  it('is medium by default and takes each size', () => {
    const { rerender } = renderWithProviders(<Avatar name="Ana" data-testid="avatar" />)

    expect(screen.getByTestId('avatar')).toHaveAttribute('data-size', 'md')

    for (const size of sizes) {
      rerender(<Avatar name="Ana" size={size} data-testid="avatar" />)

      expect(screen.getByTestId('avatar')).toHaveAttribute('data-size', size)
    }
  })

  it('does not pass name, src and size to the page as attributes of the root', () => {
    renderWithProviders(<Avatar name="Ana Souza" src="/ana.png" size="lg" data-testid="avatar" />)
    const avatar = screen.getByTestId('avatar')

    expect(avatar).not.toHaveAttribute('name')
    expect(avatar).not.toHaveAttribute('src')
    expect(avatar).not.toHaveAttribute('size')
  })

  it('passes the other attributes to the root', () => {
    renderWithProviders(<Avatar name="Ana Souza" id="me" title="Your account" data-testid="avatar" />)
    const avatar = screen.getByTestId('avatar')

    expect(avatar.tagName).toBe('SPAN')
    expect(avatar).toHaveAttribute('id', 'me')
    expect(avatar).toHaveAttribute('title', 'Your account')
  })

  it('lets the caller hide it when the name is written next to it', () => {
    renderWithProviders(
      <p>
        <Avatar name="Ana Souza" aria-hidden="true" data-testid="avatar" /> Ana Souza
      </p>
    )

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('has no axe violations with an image, with initials, with children and without a name', async () => {
    const { container } = renderWithProviders(
      <div>
        <Avatar name="Ana Souza" src="/ana.png" />
        <Avatar name="Bruno Lima" />
        <Avatar name="Acme">
          <svg aria-hidden="true" />
        </Avatar>
        <Avatar />
      </div>
    )

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Avatar contract', () => {
  it('marks the root, the fallback and the image with data-slots', () => {
    renderWithProviders(<Avatar name="Ana Souza" src="/ana.png" />)

    expect(document.querySelector('[data-slot="avatar"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="avatar-fallback"]')).not.toBeNull()
    expect(document.querySelector('[data-slot="avatar-image"]')).toBe(image())
  })

  it('keeps the caller className last and lets the caller style win', () => {
    renderWithProviders(<Avatar name="Ana" className="mine" style={{ color: 'red' }} data-testid="avatar" />)
    const avatar = screen.getByTestId('avatar')

    expect(avatar.className.split(' ').at(-1)).toBe('mine')
    expect(avatar.style.color).toBe('red')
  })

  it('keeps the data-slot of the library when the caller sends one', () => {
    renderWithProviders(<Avatar name="Ana" data-slot="mine" data-testid="avatar" />)

    expect(screen.getByTestId('avatar')).toHaveAttribute('data-slot', 'avatar')
  })
})
