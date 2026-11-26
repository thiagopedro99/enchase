import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import path from 'node:path'

type Result = 'success' | 'failure' | 'cancelled' | 'skipped'

type Needs = {
  decide: { result: Result; outputs: { action: string; tested: string } }
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

const publishes = (action: string, results: { decide?: Result; package: Result; browsers: Result; tested?: string }, cancelled = false) => {
  const needs: Needs = { decide: { result: results.decide ?? 'success', outputs: { action, tested: results.tested ?? 'false' } }, package: { result: results.package }, browsers: { result: results.browsers } }
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

  it('publishes without running the checks again when that same commit already passed them on dev', () => {
    expect(publishes('publish', { tested: 'true', package: 'skipped', browsers: 'skipped' })).toBe(true)
    expect(publishes('publish', { tested: 'true', package: 'skipped', browsers: 'skipped' }, true)).toBe(false)
    expect(publishes('publish', { tested: 'true', decide: 'failure', package: 'skipped', browsers: 'skipped' })).toBe(false)
  })

  it('never publishes a commit that passed nowhere', () => {
    expect(publishes('publish', { tested: 'false', package: 'skipped', browsers: 'skipped' })).toBe(false)
    expect(publishes('publish', { tested: '', package: 'skipped', browsers: 'skipped' })).toBe(false)
    expect(publishes('publish', { tested: 'true', package: 'failure', browsers: 'skipped' })).toBe(false)
    expect(publishes('publish', { tested: 'true', package: 'skipped', browsers: 'cancelled' })).toBe(false)
  })

  it('runs the checks only when that commit did not pass them on dev', () => {
    const conditionOf = (job: string) => new RegExp(`^ {2}${job}:\\n {4}needs: decide\\n {4}if: (.+)$`, 'm').exec(workflow)?.[1]

    expect(conditionOf('package')).toBe("needs.decide.outputs.action == 'publish' && needs.decide.outputs.tested != 'true'")
    expect(conditionOf('browsers')).toBe(conditionOf('package'))
  })

  it('counts a check as passed only for the same commit, pushed to dev, and with a success', () => {
    const query = /actions\/workflows\/\$1\/runs\?([^"]+)"/.exec(workflow)?.[1] ?? ''

    expect(query.split('&').sort()).toEqual(['branch=dev', 'event=push', 'head_sha=$GITHUB_SHA', 'per_page=1', 'status=success'])
    expect(workflow).toContain('if [ "$(passed package.yml)" -gt 0 ] && [ "$(passed browser-tests.yml)" -gt 0 ]; then')
    expect(workflow).toMatch(/--jq '\.total_count' \|\| echo 0/)
    expect(workflow).toMatch(/^ {6}tested: \$\{\{ steps\.tested\.outputs\.tested \}\}$/m)
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
