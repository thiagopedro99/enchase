import { readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'

export const tokenGroups = ['color', 'shadow', 'font', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'space', 'radius', 'transition', 'motion', 'control', 'focus', 'border', 'halo', 'hit', 'state', 'z']

export const isToken = (name) => tokenGroups.some((group) => name.startsWith(`--enchase-${group}-`))

const cssFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)

    return statSync(full).isDirectory() ? cssFiles(full) : full.endsWith('.module.css') ? [full] : []
  })

const closing = (text, start) => {
  let depth = 1
  let end = start

  while (end < text.length && depth > 0) {
    if (text[end] === '(') depth += 1
    if (text[end] === ')') depth -= 1
    end += 1
  }

  return end
}

const usesIn = (value) =>
  [...value.matchAll(/var\((--enchase-[a-z0-9-]+),/g)].map((match) => {
    const start = match.index + match[0].length

    return { name: match[1], fallback: value.slice(start, closing(value, start) - 1).trim() }
  })

const kebab = (text) => text.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()

export const collectCssHooks = (componentsRoot) => {
  const found = new Map()

  for (const file of cssFiles(componentsRoot).sort()) {
    const component = basename(dirname(file))
    const css = readFileSync(file, 'utf8')

    for (const [, property, value] of css.matchAll(/^\s*(-{0,2}[a-z][a-z-]*):\s*([^;]+);/gm)) {
      for (const { name, fallback } of usesIn(value)) {
        if (isToken(name)) continue

        const entry = found.get(name) ?? { name, fallback, properties: new Set(), components: [] }

        entry.properties.add(property)
        if (!entry.components.includes(component)) entry.components.push(component)
        found.set(name, entry)
      }
    }
  }

  return [...found.values()].map((entry) => ({ ...entry, properties: [...entry.properties] }))
}

const subjectOf = (name) => name.replace(/^--enchase-/, '')

export const ownerOf = ({ name, components }) => {
  const subject = subjectOf(name)
  const prefixed = components.filter((component) => subject.startsWith(`${kebab(component)}-`)).sort((first, second) => second.length - first.length)

  return prefixed[0] ?? components[0]
}

export const resolveToken = (reference, tokens, depth = 0) => {
  const match = /^var\((--enchase-[a-z0-9-]+)(?:,\s*(.+))?\)$/.exec(reference)

  if (!match) return undefined

  const value = tokens[match[1]] ?? match[2]

  if (value === undefined) return undefined

  const next = depth < 4 ? resolveToken(value, tokens, depth + 1) : undefined

  return next ?? value
}

export const cssHooksModel = (componentsRoot, tokens = {}) => {
  const hooks = collectCssHooks(componentsRoot).map((hook) => {
    const reference = /^var\((--enchase-[a-z0-9-]+)(?:,\s*[^)]*)?\)$/.exec(hook.fallback)?.[1]
    const resolved = reference ? resolveToken(hook.fallback, tokens) : undefined

    return { name: hook.name, owner: ownerOf(hook), default: resolved ?? hook.fallback, token: resolved && reference ? reference : undefined, properties: hook.properties, components: hook.components }
  })
  const owners = [...new Set(hooks.map((hook) => hook.owner))].sort((first, second) => (first.toLowerCase() < second.toLowerCase() ? -1 : 1))

  return owners.map((owner) => ({ component: owner, hooks: hooks.filter((hook) => hook.owner === owner).sort((first, second) => (first.name < second.name ? -1 : 1)) }))
}
