import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import path from 'node:path'

const root = path.resolve(__dirname, '../../..')

const references = (file: string) => [...new Set([...readFileSync(path.join(root, file), 'utf8').matchAll(/`((?:src|scripts|\.github)\/[^`\s]+)`/g)].map((match) => match[1]))]

const missing = (file: string) => references(file).filter((reference) => !existsSync(path.join(root, reference.split('*')[0])))

describe('the files that the documents name', () => {
  it('exist, so that a claim of ACCESSIBILITY.md always names a test or a script that is still there', () => {
    expect(references('ACCESSIBILITY.md').length).toBeGreaterThan(20)
    expect(missing('ACCESSIBILITY.md')).toEqual([])
  })
})
