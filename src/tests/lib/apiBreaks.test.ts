import { describe, expect, it } from 'vitest'

import { breaksAgainstNotes, validBreaksFile } from '../../../scripts/apiBreaks.mjs'
import { applyBreaks } from '../../../scripts/checkApi.mjs'

const behavior = [{ key: 'element selectors', note: 'an element selector of yours loses to the library' }]

const changelog = (first: string) => `## v0.23.0\n\n### Notes\n\n${first}\n\n- A second bullet.\n\n## v0.22.0\n`

describe('the behavior list of api-breaks.json', () => {
  it('is valid next to an empty list of breaks', () => {
    expect(validBreaksFile({ since: '0.22.0', breaks: [], behavior })).toBe(true)
  })

  it('stays optional, so that a file without it is still valid', () => {
    expect(validBreaksFile({ since: '0.22.0', breaks: [] })).toBe(true)
  })

  it('needs a key and a note in each item', () => {
    expect(validBreaksFile({ since: '0.22.0', breaks: [], behavior: [{ key: 'element selectors' }] })).toBe(false)
  })

  it('has to be cited by the first bullet of the notes of its release', () => {
    const file = { since: '0.22.0', breaks: [], behavior }

    expect(breaksAgainstNotes({ file, changelog: changelog('- Your class wins over the library; an element selector of yours (element selectors) loses.'), version: '0.23.0', highest: '0.22.0' })).toEqual({ errors: [], warnings: [] })
    expect(breaksAgainstNotes({ file, changelog: changelog('- No breaking change.'), version: '0.23.0', highest: '0.22.0' }).errors).toEqual([expect.stringContaining('element selectors')])
  })

  it('is not compared with the changes the api check detects, which only covers breaks', () => {
    expect(applyBreaks({ detected: [], file: { since: '0.22.0', breaks: [], behavior }, baseline: '0.22.0' }).errors).toEqual([])
  })
})
