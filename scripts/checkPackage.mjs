import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { exports } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

const targets = (value) => (typeof value === 'string' ? [value] : Object.values(value).flatMap(targets))

const built = [...new Set(targets(exports))].filter((target) => target.startsWith('./dist-lib/'))
const broken = built.filter((target) => !existsSync(join(root, target)) || statSync(join(root, target)).size === 0)

if (broken.length > 0) {
  console.error(`the package exports point to files that are missing or empty:\n${broken.map((target) => `  - ${target}`).join('\n')}`)
  process.exit(1)
}

console.log(`package outputs checked: ${built.length} export targets exist and are not empty`)
