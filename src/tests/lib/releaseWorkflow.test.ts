import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import path from 'node:path'

type Result = 'success' | 'failure' | 'cancelled' | 'skipped'

type Needs = {
  decide: { result: Result; outputs: { action: string } }
  package: { result: Result }
  browsers: { result: Result }
}

const root = path.resolve(__dirname, '../../..')

const workflow = readFileSync(path.join(root, '.github/workflows/release.yml'), 'utf8')

const publishCondition = () => {
  const block = /^ {2}publish:\n([\s\S]*?)(?=^ {2}[a-z-]+:\n|(?![\s\S]))/m.exec(workflow)?.[1] ?? ''
  const line = /^ {4}if: (.+)$/m.exec(block)?.[1] ?? ''

  return line.replace(/^\$\{\{\s*/, '').replace(/\s*\}\}$/, '')
}

const publishes = (action: string, results: { decide?: Result; package: Result; browsers: Result }, cancelled = false) => {
  const needs: Needs = { decide: { result: results.decide ?? 'success', outputs: { action } }, package: { result: results.package }, browsers: { result: results.browsers } }
  const failed = Object.values(needs).some((need) => need.result === 'failure')

  return Boolean(new Function('needs', 'cancelled', 'failure', `return ${publishCondition()}`)(needs, () => cancelled, () => failed))
}

describe('the publish job of the release workflow', () => {
  it('has a condition to read', () => {
    expect(publishCondition()).toContain('needs.decide.outputs.action')
  })

  it('publishes when the checks of that commit passed', () => {
    expect(publishes('publish', { package: 'success', browsers: 'success' })).toBe(true)
  })

  it('does not publish when a check was skipped, failed or was canceled', () => {
    expect(publishes('publish', { package: 'skipped', browsers: 'success' })).toBe(false)
    expect(publishes('publish', { package: 'success', browsers: 'skipped' })).toBe(false)
    expect(publishes('publish', { package: 'failure', browsers: 'success' })).toBe(false)
    expect(publishes('publish', { package: 'success', browsers: 'failure' })).toBe(false)
    expect(publishes('publish', { package: 'success', browsers: 'cancelled' })).toBe(false)
    expect(publishes('publish', { package: 'success', browsers: 'success' }, true)).toBe(false)
  })

  it('only tags, without the checks, when the version is already on npm', () => {
    expect(publishes('tag', { package: 'skipped', browsers: 'skipped' })).toBe(true)
    expect(publishes('tag', { package: 'failure', browsers: 'skipped' })).toBe(false)
  })

  it('does nothing for any other decision or when the decision itself failed', () => {
    expect(publishes('none', { package: 'skipped', browsers: 'skipped' })).toBe(false)
    expect(publishes('publish', { decide: 'failure', package: 'success', browsers: 'success' })).toBe(false)
    expect(publishes('publish', { decide: 'skipped', package: 'success', browsers: 'success' })).toBe(false)
  })
})
