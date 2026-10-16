import { execFileSync, spawnSync } from 'node:child_process'
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const windows = process.platform === 'win32'
const changelogen = 'changelogen@0.6.2'
const versionPattern = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/

export const parseVersion = (value) => {
  const match = versionPattern.exec(value)

  if (!match) throw new Error(`"${value}" is not a valid version: expected major.minor.patch with an optional prerelease`)

  return { core: [Number(match[1]), Number(match[2]), Number(match[3])], prerelease: match[4] ? match[4].split('.') : [] }
}

const compareIdentifiers = (left, right) => {
  const leftNumeric = /^\d+$/.test(left)
  const rightNumeric = /^\d+$/.test(right)

  if (leftNumeric && rightNumeric) return Math.sign(Number(left) - Number(right))
  if (leftNumeric) return -1
  if (rightNumeric) return 1

  return left < right ? -1 : left > right ? 1 : 0
}

export const compareVersions = (first, second) => {
  const left = parseVersion(first)
  const right = parseVersion(second)

  for (let index = 0; index < 3; index += 1) {
    const difference = left.core[index] - right.core[index]

    if (difference !== 0) return Math.sign(difference)
  }

  if (left.prerelease.length === 0 && right.prerelease.length === 0) return 0
  if (left.prerelease.length === 0) return 1
  if (right.prerelease.length === 0) return -1

  const length = Math.max(left.prerelease.length, right.prerelease.length)

  for (let index = 0; index < length; index += 1) {
    if (left.prerelease[index] === undefined) return -1
    if (right.prerelease[index] === undefined) return 1

    const result = compareIdentifiers(left.prerelease[index], right.prerelease[index])

    if (result !== 0) return result
  }

  return 0
}

export const distTag = (version) => (parseVersion(version).prerelease.length > 0 ? 'next' : 'latest')

export const decideRelease = ({ version, published, tagExists }) => {
  const tag = distTag(version)

  if (version === '0.0.0') return { action: 'skip', tag, reason: 'the version is still the 0.0.0 placeholder' }

  if (published.includes(version)) {
    return tagExists ? { action: 'skip', tag, reason: `v${version} is already on npm and tagged` } : { action: 'tag', tag, reason: `v${version} is on npm but has no tag yet` }
  }

  if (tagExists) return { action: 'fail', tag, reason: `the tag v${version} exists but ${version} is not on npm` }

  const highest = published.reduce((best, item) => (best === undefined || compareVersions(item, best) > 0 ? item : best), undefined)

  if (highest !== undefined && compareVersions(version, highest) <= 0) return { action: 'fail', tag, reason: `${version} is not greater than ${highest}, the highest version on npm` }

  return { action: 'publish', tag, reason: `${version} is not on npm yet` }
}

export const extractSection = (markdown, version) => {
  const lines = markdown.split(/\r?\n/)
  const start = lines.findIndex((line) => line.trim() === `## v${version}`)

  if (start === -1) return ''

  const end = lines.findIndex((line, index) => index > start && line.startsWith('## '))

  return lines
    .slice(start + 1, end === -1 ? undefined : end)
    .join('\n')
    .trim()
}

export const syncLockVersion = (lock, version) => {
  const packages = lock.packages && lock.packages[''] ? { ...lock.packages, '': { ...lock.packages[''], version } } : lock.packages

  return { ...lock, version, ...(packages ? { packages } : {}) }
}

const run = (command, args) => execFileSync(command, args, { cwd: root, stdio: 'inherit', shell: windows })

const capture = (command, args) => execFileSync(command, args, { cwd: root, shell: windows }).toString().trim()

const readPackage = () => JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

const publishedVersions = async (name) => {
  const response = await fetch(`https://registry.npmjs.org/${name.replace('/', '%2f')}`, { headers: { accept: 'application/vnd.npm.install-v1+json' } })

  if (response.status === 404) return []
  if (!response.ok) throw new Error(`the npm registry answered ${response.status}`)

  return Object.keys((await response.json()).versions ?? {})
}

const remoteTagExists = (tag) => {
  const result = spawnSync('git', ['ls-remote', '--exit-code', '--tags', 'origin', `refs/tags/${tag}`], { cwd: root, shell: windows })

  if (result.status === 0) return true
  if (result.status === 2) return false

  throw new Error(`could not list the remote tags: ${result.stderr}`)
}

const check = async () => {
  const { name, version } = readPackage()
  const decision = decideRelease({ version, published: await publishedVersions(name), tagExists: remoteTagExists(`v${version}`) })
  const outputs = { action: decision.action, version, tag: decision.tag, prerelease: String(parseVersion(version).prerelease.length > 0), reason: decision.reason }

  console.log(`release decision: ${decision.action} (${decision.reason})`)

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      Object.entries(outputs)
        .map(([key, value]) => `${key}=${value}\n`)
        .join('')
    )
  }

  if (decision.action === 'fail') process.exitCode = 1
}

const notes = (version) => {
  const file = join(root, 'CHANGELOG.md')
  const section = existsSync(file) ? extractSection(readFileSync(file, 'utf8'), version) : ''

  console.log(section || `Release v${version}`)
}

const preview = () => {
  run('git', ['fetch', '--tags', '--quiet'])
  run(windows ? 'npx.cmd' : 'npx', ['--yes', changelogen])
}

const prepare = (version) => {
  if (!version) throw new Error('usage: npm run release -- <version>')

  const current = readPackage().version

  parseVersion(version)

  if (compareVersions(version, current) <= 0) throw new Error(`the new version must be greater than ${current}`)
  if (capture('git', ['status', '--porcelain'])) throw new Error('the working tree is not clean: commit or stash your changes first')

  run('git', ['fetch', '--tags', '--quiet'])
  run(windows ? 'npx.cmd' : 'npx', ['--yes', changelogen, '--release', '-r', version, '--no-commit', '--no-tag', '--no-github'])

  const lockFile = join(root, 'package-lock.json')

  writeFileSync(lockFile, `${JSON.stringify(syncLockVersion(JSON.parse(readFileSync(lockFile, 'utf8')), version), null, 2)}\n`)

  run('git', ['add', 'package.json', 'package-lock.json', 'CHANGELOG.md'])
  run('git', ['commit', '-m', `chore(release): v${version}`])

  console.log(`\nrelease commit created for v${version}. Read it with "git show", edit CHANGELOG.md and amend if needed, then push to main.`)
}

const main = async ([command, argument]) => {
  if (command === 'check') return check()
  if (command === 'notes') return notes(argument)
  if (command === 'preview') return preview()
  if (command === 'prepare') return prepare(argument)

  throw new Error('usage: node scripts/release.mjs <check | notes <version> | preview | prepare <version>>')
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    await main(process.argv.slice(2))
  } catch (error) {
    console.error(`release: ${error.message}`)
    process.exitCode = 1
  }
}
