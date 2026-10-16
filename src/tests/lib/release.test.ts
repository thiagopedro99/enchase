import { describe, expect, it } from 'vitest'

import { compareVersions, decideRelease, distTag, extractSection, parseVersion, syncLockVersion } from '../../../scripts/release.mjs'

describe('parseVersion', () => {
  it('reads the core numbers and the prerelease identifiers', () => {
    expect(parseVersion('1.2.3')).toEqual({ core: [1, 2, 3], prerelease: [] })
    expect(parseVersion('0.10.0-rc.1')).toEqual({ core: [0, 10, 0], prerelease: ['rc', '1'] })
  })

  it.each(['', '1.2', 'v1.2.3', '1.2.3+build', '1.2.3-', '01.2.x'])('rejects %j', (value) => {
    expect(() => parseVersion(value)).toThrow('is not a valid version')
  })
})

describe('compareVersions', () => {
  it('orders the core numbers numerically, not as text', () => {
    expect(compareVersions('0.1.0', '0.1.1')).toBe(-1)
    expect(compareVersions('0.2.0', '0.1.9')).toBe(1)
    expect(compareVersions('0.10.0', '0.9.0')).toBe(1)
    expect(compareVersions('1.0.0', '0.99.99')).toBe(1)
    expect(compareVersions('2.3.4', '2.3.4')).toBe(0)
  })

  it('follows the semver precedence for prereleases', () => {
    const ordered = ['1.0.0-alpha', '1.0.0-alpha.1', '1.0.0-alpha.beta', '1.0.0-beta', '1.0.0-beta.2', '1.0.0-beta.11', '1.0.0-rc.1', '1.0.0']

    for (let index = 1; index < ordered.length; index += 1) {
      expect(compareVersions(ordered[index - 1], ordered[index])).toBe(-1)
      expect(compareVersions(ordered[index], ordered[index - 1])).toBe(1)
    }
  })

  it('puts a release above its own prerelease', () => {
    expect(compareVersions('0.2.0', '0.2.0-rc.3')).toBe(1)
    expect(compareVersions('0.2.0-rc.3', '0.2.0')).toBe(-1)
  })
})

describe('distTag', () => {
  it('publishes releases as latest and prereleases as next', () => {
    expect(distTag('0.1.0')).toBe('latest')
    expect(distTag('0.2.0-rc.1')).toBe('next')
  })
})

describe('decideRelease', () => {
  it('never publishes the 0.0.0 placeholder', () => {
    expect(decideRelease({ version: '0.0.0', published: [], tagExists: false })).toMatchObject({ action: 'skip' })
  })

  it('publishes a version that is not on npm yet', () => {
    expect(decideRelease({ version: '0.1.0', published: [], tagExists: false })).toMatchObject({ action: 'publish', tag: 'latest' })
    expect(decideRelease({ version: '0.1.1', published: ['0.1.0'], tagExists: false })).toMatchObject({ action: 'publish', tag: 'latest' })
  })

  it('publishes a prerelease under the next tag', () => {
    expect(decideRelease({ version: '0.2.0-rc.1', published: ['0.1.0'], tagExists: false })).toMatchObject({ action: 'publish', tag: 'next' })
  })

  it('does nothing when the version is on npm and tagged', () => {
    expect(decideRelease({ version: '0.1.0', published: ['0.1.0'], tagExists: true })).toMatchObject({ action: 'skip' })
  })

  it('only creates the tag when the version is on npm but untagged, as after a manual first publish', () => {
    expect(decideRelease({ version: '0.1.0', published: ['0.1.0'], tagExists: false })).toMatchObject({ action: 'tag' })
  })

  it('fails when the tag exists but the version is not on npm', () => {
    expect(decideRelease({ version: '0.1.1', published: ['0.1.0'], tagExists: true })).toMatchObject({ action: 'fail' })
  })

  it('fails when the version is not greater than the highest one on npm', () => {
    expect(decideRelease({ version: '0.1.5', published: ['0.1.0', '0.2.0'], tagExists: false })).toMatchObject({ action: 'fail' })
    expect(decideRelease({ version: '0.2.0-rc.1', published: ['0.2.0'], tagExists: false })).toMatchObject({ action: 'fail' })
  })

  it('compares against the highest published version, whatever the registry order', () => {
    expect(decideRelease({ version: '0.10.0', published: ['0.9.0', '0.2.0', '0.1.0'], tagExists: false })).toMatchObject({ action: 'publish' })
  })
})

describe('extractSection', () => {
  const changelog = ['# Changelog', '', '## v0.2.0', '', '### Fixes', '', '- fix: one', '', '## v0.2.0-rc.1', '', '- rc', '', '## v0.1.0', '', 'First release.', ''].join('\n')

  it('returns the body of one version, subsections included, up to the next version', () => {
    expect(extractSection(changelog, '0.2.0')).toBe('### Fixes\n\n- fix: one')
    expect(extractSection(changelog, '0.1.0')).toBe('First release.')
  })

  it('does not confuse a version with its prerelease', () => {
    expect(extractSection(changelog, '0.2.0-rc.1')).toBe('- rc')
  })

  it('returns an empty string when the version is missing', () => {
    expect(extractSection(changelog, '9.9.9')).toBe('')
  })

  it('reads files with Windows line endings', () => {
    expect(extractSection(changelog.split('\n').join('\r\n'), '0.1.0')).toBe('First release.')
  })
})

describe('syncLockVersion', () => {
  const lock = { name: 'enchase', version: '0.0.0', lockfileVersion: 3, requires: true, packages: { '': { name: 'enchase', version: '0.0.0' }, 'node_modules/react': { version: '19.0.0' } } }

  it('updates both version fields without touching anything else or the key order', () => {
    const next = syncLockVersion(lock, '0.1.0') as typeof lock

    expect(next.version).toBe('0.1.0')
    expect(next.packages[''].version).toBe('0.1.0')
    expect(next.packages['node_modules/react']).toEqual({ version: '19.0.0' })
    expect(Object.keys(next)).toEqual(Object.keys(lock))
    expect(Object.keys(next.packages[''])).toEqual(['name', 'version'])
  })

  it('does not change the lock it receives', () => {
    syncLockVersion(lock, '0.1.0')

    expect(lock.version).toBe('0.0.0')
    expect(lock.packages[''].version).toBe('0.0.0')
  })

  it('works on a lock without the packages map', () => {
    expect(syncLockVersion({ name: 'enchase', version: '0.0.0' }, '0.1.0')).toEqual({ name: 'enchase', version: '0.1.0' })
  })
})
