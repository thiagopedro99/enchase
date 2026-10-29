import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { consumerCss } from './consumerCss.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { exports } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

const targets = (value) => (typeof value === 'string' ? [value] : Object.values(value).flatMap(targets))

const built = [...new Set(targets(exports))].filter((target) => target.startsWith('./dist-lib/'))
const broken = built.filter((target) => !existsSync(join(root, target)) || statSync(join(root, target)).size === 0)

if (broken.length > 0) {
  console.error(`the package exports point to files that are missing or empty:\n${broken.map((target) => `  - ${target}`).join('\n')}`)
  process.exit(1)
}

const clientEntry = exports['.'].import

if (!/^["']use client["'];?\r?\n/.test(readFileSync(join(root, clientEntry), 'utf8'))) {
  console.error(`${clientEntry} must start with the "use client" directive, or React Server Components cannot import the package`)
  process.exit(1)
}

const importsOf = (file) => [...readFileSync(file, 'utf8').matchAll(/(?:\bfrom|\bimport)\s*\(?\s*['"]([^'"]+)['"]/g)].map((match) => match[1])

const reach = (entry) => {
  const files = new Set()
  const packages = new Set()

  const visit = (file) => {
    if (files.has(file)) return

    files.add(file)

    for (const specifier of importsOf(file)) {
      if (!specifier.startsWith('.')) packages.add(specifier)
      else if (specifier.endsWith('.js') && existsSync(resolve(dirname(file), specifier))) visit(resolve(dirname(file), specifier))
    }
  }

  visit(entry)

  return { files: [...files].map((file) => relative(root, file).split(sep).join('/')), packages: [...packages] }
}

const stylePrefix = './styles/'
const jsEntries = Object.entries(exports).filter(([, value]) => typeof value === 'object' && typeof value.import === 'string' && value.import.endsWith('.js'))
const leaks = []

for (const [key, value] of jsEntries) {
  const { files, packages } = reach(join(root, value.import))

  if (!key.startsWith(stylePrefix)) {
    const styles = files.filter((file) => file.startsWith('dist-lib/styles/presets/'))

    if (styles.length > 0) leaks.push(`${key} reaches the style definitions (${styles.join(', ')}), so every user of it would pay for them`)

    continue
  }

  const own = `dist-lib/styles/presets/${key.slice(stylePrefix.length)}.js`
  const others = files.filter((file) => file.startsWith('dist-lib/styles/presets/') && file !== own)
  const outside = files.filter((file) => file !== value.import.replace(/^\.\//, '') && !file.startsWith('dist-lib/styles/'))

  if (!files.includes(own)) leaks.push(`${key} does not reach its own style (${own})`)
  if (others.length > 0) leaks.push(`${key} reaches the definition of another style (${others.join(', ')}), so every user of it would pay for both`)
  if (outside.length > 0) leaks.push(`${key} reaches code that is not part of the styles (${outside.join(', ')})`)
  if (packages.length > 0) leaks.push(`${key} imports packages (${packages.join(', ')}), and a style is only data`)
}

const presetsDir = join(root, 'dist-lib', 'styles', 'presets')
const builtStyles = existsSync(presetsDir) ? readdirSync(presetsDir).filter((file) => file.endsWith('.js')).map((file) => file.slice(0, -'.js'.length)) : []

for (const name of builtStyles) {
  if (!(`${stylePrefix}${name}` in exports)) leaks.push(`the style ${name} is built but the package does not export ${stylePrefix}${name}`)
}

if (builtStyles.length === 0) leaks.push('the package builds no style')

for (const key of ['./styles', './styles/*']) {
  if (key in exports) leaks.push(`the package exports ${key}: leave it out, so that forgetting the .css of ./styles.css fails instead of resolving to code that does nothing`)
}

const rightToLeft = /\[dir=["']?rtl["']?\]/g

const sources = readdirSync(join(root, 'src'), { recursive: true }).filter((name) => name.endsWith('.module.css'))
const wanted = sources.map((name) => (readFileSync(join(root, 'src', name), 'utf8').match(rightToLeft) ?? []).length).reduce((sum, count) => sum + count, 0)

for (const file of ['dist-lib/styles.css', 'dist-lib/styles.layer.css']) {
  const stylesheets = [
    [file, readFileSync(join(root, file), 'utf8')],
    [`${file} after the default build of Vite`, await consumerCss(join(root, file))]
  ]

  for (const [where, css] of stylesheets) {
    const found = (css.match(rightToLeft) ?? []).length

    if (found !== wanted) leaks.push(`${where} has ${found} [dir=rtl] selectors and the sources have ${wanted}: a right to left rule did not survive`)
    if (css.includes(':dir(')) leaks.push(`${where} has :dir() selectors: an app that builds for a browser without :dir() gets them rewritten as :lang() lists, which follow the language of the page and not its direction, so a right to left rule must read the dir attribute`)
    if (css.includes(':lang(')) leaks.push(`${where} has :lang() selectors, which the sources do not: a right to left rule was rewritten as a list of languages, and a document with dir="rtl" and lang="en" is not mirrored`)
    if (css.includes('data-density')) leaks.push(`${where} reads data-density, which only theme.css may do: the compact density block is written with the theme, so that it follows the layer of the theme, and not with the components`)
  }
}

const themeFile = 'dist-lib/theme.css'
const densitySelectors = [':root[data-density=compact]', ':where(:root[data-density=compact])']

const themeStylesheets = [
  [themeFile, readFileSync(join(root, themeFile), 'utf8')],
  [`${themeFile} after the default build of Vite`, await consumerCss(join(root, themeFile))]
]

for (const [where, css] of themeStylesheets) {
  const selectors = [...css.matchAll(/([^{}]+)\{[^{}]*\}/g)]
    .map((match) => match[1].trim().replace(/["']/g, ''))
    .filter((selector) => selector.includes('data-density'))
    .sort()
  const mentions = css.split('data-density').length - 1
  const exact = selectors.length === densitySelectors.length && selectors.every((selector, index) => selector === densitySelectors[index])

  if (!exact || mentions !== densitySelectors.length) {
    leaks.push(`${where} must have the compact density block once, as the rules ${densitySelectors.join(' and ')}, and read data-density nowhere else, so that the attribute does nothing on any element but the root: it has ${selectors.length} such rules and ${mentions} mentions of the attribute`)
  }
}

if (leaks.length > 0) {
  console.error(`the package is not as it should be:\n${leaks.map((leak) => `  - ${leak}`).join('\n')}`)
  process.exit(1)
}

console.log(`package outputs checked: ${built.length} export targets exist and are not empty, ${clientEntry} starts with "use client", each ${stylePrefix}<name> entry reaches only its own style, which no other entry reaches (${jsEntries.length} entries walked), the css mirrors right to left from the dir attribute, as published and after the default build of Vite, and the compact density block is in theme.css once, behind the attribute on the root, and in no other stylesheet`)
