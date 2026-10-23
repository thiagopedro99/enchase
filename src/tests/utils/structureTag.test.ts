import { describe, expect, it } from 'vitest'

import { defaultTag, roleOf, structureTags } from '@utils/structureTag.ts'

describe('structureTags', () => {
  it('lists only the tags that give structure, never a link, a button or a form control', () => {
    expect(structureTags).toEqual(['div', 'section', 'article', 'aside', 'nav', 'header', 'footer', 'main', 'ul', 'ol', 'li'])
  })

  it('renders a div unless told otherwise', () => {
    expect(defaultTag).toBe('div')
    expect(structureTags).toContain(defaultTag)
  })
})

describe('roleOf', () => {
  it('names the role of a list for ul and ol only, so a list keeps its meaning in Safari once its markers are gone', () => {
    expect(structureTags.filter((tag) => roleOf(tag) === 'list')).toEqual(['ul', 'ol'])
    expect(structureTags.filter((tag) => roleOf(tag) !== undefined && roleOf(tag) !== 'list')).toEqual([])
  })
})
