import { describe, expect, it } from 'vitest'

import { checkDraft, issueOf } from '@demo/pages/sugestoes/draft.ts'
import { plainText } from '@demo/pages/sugestoes/github.ts'

const draft = { kind: 'melhoria', title: 'Sticky columns in the table', need: 'I need the first column to stay in place.', proposal: '' }

describe('Suggestion draft', () => {
  it('takes a complete draft and gives it back clean', () => {
    expect(checkDraft({ ...draft, title: `  ${draft.title}  `, extra: 'ignored' })).toEqual({ ok: true, draft })
  })

  it.each([
    [{ ...draft, title: '' }, { title: 'missing' }],
    [{ ...draft, title: 'Short' }, { title: 'short' }],
    [{ ...draft, need: '' }, { need: 'missing' }],
    [{ ...draft, kind: 'outro' }, { kind: 'invalid' }],
    [null, { kind: 'invalid', title: 'missing', need: 'missing' }],
    ['text', { kind: 'invalid', title: 'missing', need: 'missing' }]
  ])('says what is wrong with %j', (value, problems) => {
    expect(checkDraft(value)).toEqual({ ok: false, problems })
  })

  it('writes the issue with the headings of the template, which the card leaves out of its summary', () => {
    const { title, body, labels } = issueOf({ ...draft, kind: 'correcao', proposal: 'Open the table and scroll.' })

    expect(title).toBe(draft.title)
    expect(labels).toEqual(['bug'])
    expect(body).toContain('**What happened, and what you expected**')
    expect(body).toContain('**How to reproduce it**')
    expect(plainText(body, 150)).toBe('I need the first column to stay in place. Open the table and scroll.')
  })
})
