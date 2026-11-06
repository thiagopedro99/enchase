import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import { consumerCss } from './consumerCss.mjs'
import { cssFileProblems } from './cssFiles.mjs'
import { deprecationGaps } from './hookDeclarations.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const { bin, exports, files, version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

const targets = (value) => (typeof value === 'string' ? [value] : Object.values(value).flatMap(targets))

const built = [...new Set(targets(exports))].filter((target) => target.startsWith('./dist-lib/') && !target.includes('*'))
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
const headlessPrefix = './headless/'
const experimentalPrefix = './experimental/'
const hookPrefixes = [headlessPrefix, experimentalPrefix]
const pascal = (kebab) => kebab.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join('')
const jsEntries = Object.entries(exports).filter(([, value]) => typeof value === 'object' && typeof value.import === 'string' && value.import.endsWith('.js'))
const leaks = []

for (const [key, value] of jsEntries) {
  const { files, packages } = reach(join(root, value.import))

  if (!key.startsWith(stylePrefix)) {
    const styles = files.filter((file) => file.startsWith('dist-lib/styles/presets/'))

    if (styles.length > 0) leaks.push(`${key} reaches the style definitions (${styles.join(', ')}), so every user of it would pay for them`)

    const hookPrefix = hookPrefixes.find((prefix) => key.startsWith(prefix))

    if (hookPrefix) {
      const entry = value.import.replace(/^\.\//, '')
      const kebab = key.slice(hookPrefix.length)
      const name = pascal(kebab)
      const hook = `dist-lib/components/common/${name}/use${name}.js`
      const own = [entry, `dist-lib/headless/${kebab}.js`]
      const components = files.filter((file) => file === 'dist-lib/index.js' || /^dist-lib\/components\/.+\/index\.js$/.test(file))
      const siblings = files.filter((file) => /^dist-lib\/(headless|experimental)\//.test(file) && !own.includes(file))
      const stylesheets = files.filter((file) => importsOf(join(root, file)).some((specifier) => specifier.endsWith('.css')))

      if (!/^["']use client["'];?\r?\n/.test(readFileSync(join(root, value.import), 'utf8'))) leaks.push(`${key} must start with the "use client" directive, like the main entry, or a hook that is imported in a Server Component fails with a message that does not say why`)
      if (!files.includes(hook)) leaks.push(`${key} does not reach its hook (${hook})`)
      if (components.length > 0) leaks.push(`${key} reaches a component (${components.join(', ')}): a hook must not pull the markup of the library, which is what it replaces`)
      if (siblings.length > 0) leaks.push(`${key} reaches another hook entry (${siblings.join(', ')}), so the hooks would not be independent`)

      if (hookPrefix === experimentalPrefix) {
        const headlessFile = join(root, own[1])
        const alias = existsSync(headlessFile) && (readFileSync(join(root, value.import), 'utf8') === readFileSync(headlessFile, 'utf8') || importsOf(join(root, value.import)).includes(`../headless/${kebab}.js`))

        if (!alias) leaks.push(`${key} is not an alias of ${headlessPrefix}${kebab}: it must export what that entry exports, from the same modules, or the old path would drift from the new one`)

        const headlessTypes = join(root, 'dist-lib', 'types', 'lib', 'headless', `${kebab}.d.ts`)
        const oldTypes = join(root, value.types ?? '')

        if (!existsSync(headlessTypes) || !existsSync(oldTypes)) leaks.push(`${key} or ${headlessPrefix}${kebab} has no declaration file`)
        else deprecationGaps(readFileSync(headlessTypes, 'utf8'), readFileSync(oldTypes, 'utf8')).forEach((gap) => leaks.push(`${key}: ${gap}, and every export of the old entry must carry @deprecated so that the editor and tsc point to ${headlessPrefix}${kebab}`))
      }
      if (stylesheets.length > 0) leaks.push(`${key} imports a stylesheet (${stylesheets.join(', ')}): a hook carries no css`)
    }

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

const builtHooks = (prefix) => {
  const dir = join(root, 'dist-lib', prefix.slice('./'.length, -1))

  return existsSync(dir) ? readdirSync(dir).filter((file) => file.endsWith('.js')).map((file) => file.slice(0, -'.js'.length)).sort() : []
}

for (const prefix of hookPrefixes) {
  const built = builtHooks(prefix)

  for (const name of built) {
    if (!(`${prefix}${name}` in exports)) leaks.push(`the hook entry ${name} is built but the package does not export ${prefix}${name}`)
  }

  if (built.length === 0) leaks.push(`the package builds no ${prefix.slice('./'.length, -1)} entry`)
}

if (builtHooks(headlessPrefix).join() !== builtHooks(experimentalPrefix).join()) leaks.push('the headless and the experimental entries are not the same hooks, and each hook of the old path must have its new one')

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

const cssPattern = './css/*'
const cssDir = join(root, 'dist-lib', 'css')

if (exports[cssPattern] !== './dist-lib/css/*') leaks.push(`the package must export ${cssPattern} as ./dist-lib/css/*, so that enchase/css/<component>.css and enchase/css/index.json resolve`)

if (!existsSync(join(cssDir, 'index.json'))) leaks.push('dist-lib/css/index.json is missing, so the package ships no map of the css of each component')
else {
  const toPosix = (name) => name.split(sep).join('/')
  const cssNames = readdirSync(cssDir).filter((name) => name.endsWith('.css')).sort()
  const js = Object.fromEntries(readdirSync(join(root, 'dist-lib'), { recursive: true }).filter((name) => name.endsWith('.js')).map((name) => [toPosix(name), readFileSync(join(root, 'dist-lib', name), 'utf8')]))

  leaks.push(
    ...cssFileProblems({
      map: JSON.parse(readFileSync(join(cssDir, 'index.json'), 'utf8')),
      files: Object.fromEntries(cssNames.map((name) => [name, readFileSync(join(cssDir, name), 'utf8')])),
      styles: readFileSync(join(root, 'dist-lib', 'styles.css'), 'utf8'),
      sources: sources.map(toPosix).filter((name) => name.startsWith('components/')),
      js
    })
  )
}

const kitIndex = join(root, 'eject', 'index.json')
const binFile = bin?.enchase ? join(root, bin.enchase) : null

if (!binFile || !existsSync(binFile)) leaks.push('the bin of the package does not point to a file, so npx enchase has nothing to run')
else if (!readFileSync(binFile, 'utf8').startsWith('#!/usr/bin/env node\n')) leaks.push(`${bin.enchase} must start with the node shebang, or the command does not run where npm links it`)
if (!files.includes('bin')) leaks.push('the bin folder is not in the files of the package, so the eject command is not published')

if (!files.includes('eject')) leaks.push('the eject folder is not in the files of the package, so the sources that the eject command copies are not published')
if (JSON.stringify(exports).includes('/eject/')) leaks.push('an export points into the eject folder: the sources are copied by the command, and an import of them would put a second copy of a component in a bundle')

if (!existsSync(kitIndex)) leaks.push('eject/index.json is missing, so the package ships no sources to copy')
else {
  const kit = JSON.parse(readFileSync(kitIndex, 'utf8'))
  const lacking = Object.values(kit.entries).flatMap((entry) => entry.files).filter((file) => !existsSync(join(root, 'eject', 'files', file)))

  if (kit.version !== version) leaks.push(`eject/index.json is of ${kit.version} and the package is ${version}: build the kit again`)
  if (lacking.length > 0) leaks.push(`eject/index.json lists files that the kit does not have: ${lacking.join(', ')}`)
}

if (leaks.length > 0) {
  console.error(`the package is not as it should be:\n${leaks.map((leak) => `  - ${leak}`).join('\n')}`)
  process.exit(1)
}

console.log(`package outputs checked: ${built.length} export targets exist and are not empty, ${clientEntry} starts with "use client", each ${stylePrefix}<name> entry reaches only its own style, which no other entry reaches, and each ${headlessPrefix}<name> entry, and the ${experimentalPrefix}<name> that is an alias of it, starts with "use client" and reaches its hook and no component, stylesheet or other hook (${jsEntries.length} entries walked), the css mirrors right to left from the dir attribute, as published and after the default build of Vite, the css of each component is, all together and in order, the css of styles.css, with every module in one file and the map of the files as the javascript reaches them, and the compact density block is in theme.css once, behind the attribute on the root, and in no other stylesheet, and the eject kit has every file that it lists, out of the exports`)
