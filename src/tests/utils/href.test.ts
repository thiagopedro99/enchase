import { describe, expect, it } from 'vitest'

import { isCurrentHref, isInternalHref, isSectionHref, shouldNavigate } from '@utils/href.ts'

const plainClick = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, defaultPrevented: false }

describe('isSectionHref', () => {
  it.each(['#top', '#a-section', '#'])('treats %s as a section of the page', (href) => {
    expect(isSectionHref(href)).toBe(true)
  })

  it.each(['/docs#top', 'https://example.com/#top', '', '/'])('does not treat %j as a section', (href) => {
    expect(isSectionHref(href)).toBe(false)
  })
})

describe('isInternalHref', () => {
  it.each(['/', '/docs', '/docs/intro', '/docs?tab=1', '/docs#top', '/docs/?a=1#b'])('treats %s as a route of the app', (href) => {
    expect(isInternalHref(href)).toBe(true)
  })

  it.each(['//cdn.example.com/a.js', 'https://example.com', 'http://example.com/docs', 'mailto:a@b.co', 'tel:+5511999999999', 'javascript:alert(1)', 'ftp://example.com', '#top', 'docs', './docs', '../docs', '?tab=1', ''])(
    'does not treat %j as a route of the app',
    (href) => {
      expect(isInternalHref(href)).toBe(false)
    }
  )
})

describe('isCurrentHref', () => {
  it('matches the same route', () => {
    expect(isCurrentHref('/docs', '/docs')).toBe(true)
  })

  it('matches a parent route of the current page', () => {
    expect(isCurrentHref('/docs', '/docs/intro')).toBe(true)
    expect(isCurrentHref('/docs', '/docs/intro/deep')).toBe(true)
  })

  it('does not match a sibling whose name only starts the same way', () => {
    expect(isCurrentHref('/docs', '/docsx')).toBe(false)
    expect(isCurrentHref('/doc', '/docs')).toBe(false)
  })

  it('matches the root only on the root', () => {
    expect(isCurrentHref('/', '/')).toBe(true)
    expect(isCurrentHref('/', '/docs')).toBe(false)
  })

  it('ignores the trailing slash, the query and the hash on both sides', () => {
    expect(isCurrentHref('/docs/', '/docs')).toBe(true)
    expect(isCurrentHref('/docs', '/docs/')).toBe(true)
    expect(isCurrentHref('/docs?tab=1', '/docs')).toBe(true)
    expect(isCurrentHref('/docs#intro', '/docs')).toBe(true)
    expect(isCurrentHref('/docs', '/docs?tab=2#top')).toBe(true)
    expect(isCurrentHref('/?a=1', '/#top')).toBe(true)
  })

  it('is false when the current location is unknown', () => {
    expect(isCurrentHref('/docs', undefined)).toBe(false)
  })

  it('never marks an external link, a section or a mail link as current', () => {
    expect(isCurrentHref('https://example.com/docs', '/docs')).toBe(false)
    expect(isCurrentHref('//example.com/docs', '/docs')).toBe(false)
    expect(isCurrentHref('#docs', '/docs')).toBe(false)
    expect(isCurrentHref('mailto:a@b.co', '/docs')).toBe(false)
    expect(isCurrentHref('docs', '/docs')).toBe(false)
  })
})

describe('shouldNavigate', () => {
  it('handles a plain click on a route of the app', () => {
    expect(shouldNavigate('/docs', plainClick, {})).toBe(true)
    expect(shouldNavigate('/docs', plainClick, { target: '_self' })).toBe(true)
  })

  it.each([
    ['ctrl', { ctrlKey: true }],
    ['meta', { metaKey: true }],
    ['shift', { shiftKey: true }],
    ['alt', { altKey: true }],
    ['the middle button', { button: 1 }],
    ['the right button', { button: 2 }],
    ['an event already prevented', { defaultPrevented: true }]
  ])('leaves the click to the browser with %s', (_name, change) => {
    expect(shouldNavigate('/docs', { ...plainClick, ...change }, {})).toBe(false)
  })

  it('leaves the click to the browser for another target or a download', () => {
    expect(shouldNavigate('/docs', plainClick, { target: '_blank' })).toBe(false)
    expect(shouldNavigate('/docs', plainClick, { target: 'frame' })).toBe(false)
    expect(shouldNavigate('/file.pdf', plainClick, { download: '' })).toBe(false)
  })

  it.each(['https://example.com', '//example.com/a', 'mailto:a@b.co', 'tel:123', '#section', 'docs', ''])('leaves %j to the browser', (href) => {
    expect(shouldNavigate(href, plainClick, {})).toBe(false)
  })
})
