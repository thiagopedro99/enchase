import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { createRequire } from 'node:module'

import { ladderSelector, specificityOf } from './cascadeLadder.mjs'

const require = createRequire(import.meta.url)
const postcss = require('postcss')
const selectorParser = require('postcss-selector-parser')

const STATES = [':hover', ':active', ':focus', ':focus-visible', ':focus-within', ':disabled', ':visited', ':checked']
const IS_LISTS = [':is', ':matches', ':-webkit-any', ':any']
const PSEUDO_ELEMENTS = [':before', ':after', ':first-line', ':first-letter']
const COMPLEMENT = { ':enabled': ':disabled', ':disabled': ':enabled' }
const SIDES = ['top', 'right', 'bottom', 'left']
const BORDER_PARTS = ['width', 'style', 'color']

const sidesOf = (logical) => (logical === 'inline' ? ['left', 'right'] : logical === 'block' ? ['top', 'bottom'] : [logical])

const atomsOf = (prop) => {
  const p = prop.toLowerCase()
  const table = {
    margin: SIDES.map((side) => `margin-${side}`),
    padding: SIDES.map((side) => `padding-${side}`),
    inset: SIDES,
    'inset-inline': ['left', 'right'],
    'inset-block': ['top', 'bottom'],
    outline: ['outline-color', 'outline-style', 'outline-width'],
    background: ['background-color', 'background-image', 'background-position', 'background-size', 'background-repeat', 'background-attachment', 'background-origin', 'background-clip'],
    font: ['font-family', 'font-size', 'font-weight', 'font-style', 'font-variant', 'font-stretch', 'line-height', 'font-kerning', 'font-optical-sizing', 'font-feature-settings', 'font-variation-settings'],
    'text-decoration': ['text-decoration-line', 'text-decoration-style', 'text-decoration-color', 'text-decoration-thickness'],
    flex: ['flex-grow', 'flex-shrink', 'flex-basis'],
    gap: ['row-gap', 'column-gap'],
    transition: ['transition-property', 'transition-duration', 'transition-timing-function', 'transition-delay', 'transition-behavior'],
    animation: ['animation-name', 'animation-duration', 'animation-timing-function', 'animation-delay', 'animation-iteration-count', 'animation-direction', 'animation-fill-mode', 'animation-play-state', 'animation-timeline', 'animation-composition'],
    'border-radius': ['border-top-left-radius', 'border-top-right-radius', 'border-bottom-right-radius', 'border-bottom-left-radius'],
    border: SIDES.flatMap((side) => BORDER_PARTS.map((part) => `border-${side}-${part}`)),
    'border-color': SIDES.map((side) => `border-${side}-color`),
    'border-width': SIDES.map((side) => `border-${side}-width`),
    'border-style': SIDES.map((side) => `border-${side}-style`)
  }

  if (table[p]) return table[p]

  const logicalSide = p.match(/^(margin|padding)-(inline|block)(?:-start|-end)?$/)

  if (logicalSide) return sidesOf(logicalSide[2]).map((side) => `${logicalSide[1]}-${side}`)

  const logicalInset = p.match(/^inset-(inline|block)(?:-start|-end)?$/)

  if (logicalInset) return sidesOf(logicalInset[1])

  if (SIDES.includes(p)) return [p]

  const borderSide = p.match(/^border-(top|right|bottom|left|inline|block)(?:-(start|end))?(?:-(width|style|color))?$/)

  if (borderSide) {
    const parts = borderSide[3] ? [borderSide[3]] : BORDER_PARTS

    return sidesOf(borderSide[1]).flatMap((side) => parts.map((part) => `border-${side}-${part}`))
  }

  return [p]
}

const cssFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = join(dir, entry.name)

    if (entry.isDirectory()) return cssFiles(file)

    return entry.name.endsWith('.module.css') ? [file] : []
  })

const parseComplex = (selector) => {
  let complex

  selectorParser((root) => {
    complex = root.first
  }).processSync(selector)

  return complex
}

const nodesOf = (selector) => {
  const nodes = []

  parseComplex(selector).each((node) => {
    nodes.push(node)
  })

  let from = 0

  nodes.forEach((node, index) => {
    if (node.type === 'combinator') from = index + 1
  })

  return { nodes, from }
}

const subjectClasses = (selector) => {
  const { nodes, from } = nodesOf(selector)

  return new Set(nodes.slice(from).filter((node) => node.type === 'class').map((node) => node.value))
}

const targetOf = (selector) => {
  const { nodes } = nodesOf(selector)
  const last = nodes[nodes.length - 1]

  return last && last.type === 'pseudo' && (last.value.startsWith('::') || PSEUDO_ELEMENTS.includes(last.value)) ? last.value : ''
}

const expandSource = (selector) => {
  const { nodes, from } = nodesOf(selector)
  const index = nodes.findIndex(
    (node, position) =>
      position >= from &&
      node.type === 'pseudo' &&
      IS_LISTS.includes(node.value) &&
      node.nodes.length > 0 &&
      node.nodes.every((alternative) => alternative.nodes.length === 1 && alternative.nodes[0].type === 'pseudo' && alternative.nodes[0].nodes.length === 0 && !alternative.nodes[0].value.startsWith('::')) &&
      node.nodes.some((alternative) => STATES.includes(alternative.nodes[0].value))
  )

  if (index === -1) return [selector]

  return nodes[index].nodes.flatMap((alternative) => {
    const text = nodes.map((node, position) => (position === index ? String(alternative.nodes[0]).trim() : String(node))).join('')

    return expandSource(text)
  })
}

const statesOf = (selector) => {
  const positive = new Set()
  const negative = new Set()
  const { nodes, from } = nodesOf(selector)

  for (const node of nodes.slice(from)) {
    if (node.type !== 'pseudo') continue

    if (node.value === ':not') {
      for (const alternative of node.nodes) for (const part of alternative.nodes) if (part.type === 'pseudo') negative.add(part.value)
      continue
    }

    positive.add(node.value)
  }

  return { positive, negative }
}

const exclusive = (left, right) => {
  const a = statesOf(left)
  const b = statesOf(right)

  for (const state of a.positive) {
    if (b.negative.has(state)) return true
    if (COMPLEMENT[state] && b.positive.has(COMPLEMENT[state])) return true
  }

  for (const state of b.positive) if (a.negative.has(state)) return true

  return false
}

const nodeStrings = (selector) => {
  const { nodes } = nodesOf(selector)

  return new Set(nodes.filter((node) => node.type !== 'combinator').map((node) => String(node).trim()))
}

const subsetOf = (small, big) => [...small].every((item) => big.has(item))

const compare = (left, right) => left[0] - right[0] || left[1] - right[1] || left[2] - right[2]

const winnerOf = (units) =>
  units.reduce((best, unit) => {
    const order = compare(unit.original, best.original)

    return order > 0 || (order === 0 && unit.order > best.order) ? unit : best
  })

const coveredBy = (base, state, moduleUnits) => {
  const union = new Set([...nodeStrings(base.expanded), ...nodeStrings(state.expanded)])
  const positive = [...statesOf(state.expanded).positive].filter((name) => STATES.includes(name))

  return moduleUnits.filter((unit) => {
    if (unit.band !== 'state' || unit.target !== base.target) return false

    const nodes = nodeStrings(unit.expanded)

    return subsetOf(nodeStrings(base.expanded), nodes) && subsetOf(nodes, union) && positive.every((name) => nodes.has(name))
  })
}

const unitsOf = (dir) => {
  const units = []

  for (const file of cssFiles(dir)) {
    let order = 0

    postcss.parse(readFileSync(file, 'utf8')).walkRules((rule) => {
      if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return

      const props = new Set()
      const decls = new Map()

      rule.walkDecls((declaration) => {
        for (const atom of atomsOf(declaration.prop)) props.add(atom)
        decls.set(declaration.prop.toLowerCase(), declaration.value.replace(/\s+/g, ' ').trim())
      })

      order += 1

      for (const selector of rule.selectors) {
        const original = specificityOf(selector)
        const classes = subjectClasses(selector)
        const target = targetOf(selector)

        for (const expanded of expandSource(selector)) {
          const band = specificityOf(ladderSelector(expanded))[1] === 1 ? 'state' : 'base'

          units.push({ module: relative(dir, file), order, source: selector, expanded, band, original, classes, props, decls, target })
        }
      }
    })
  }

  return units
}

export const bandCandidates = (dir, { loose = false } = {}) => {
  const units = unitsOf(dir)
  const modules = [...new Set(units.map((unit) => unit.module))]
  const found = []

  for (const module of modules) {
    const list = units.filter((unit) => unit.module === module)

    for (const base of list.filter((unit) => unit.band === 'base')) {
      for (const state of list.filter((unit) => unit.band === 'state')) {
        if (base.order === state.order || base.target !== state.target || exclusive(base.expanded, state.expanded)) continue

        const order = compare(base.original, state.original)

        if (order < 0 || (order === 0 && base.order < state.order)) continue

        const shared = [...base.props].filter((atom) => state.props.has(atom))

        if (shared.length === 0) continue

        const sameNamed = [...base.decls.keys()].filter((name) => state.decls.has(name))

        if (sameNamed.length > 0 && sameNamed.every((name) => base.decls.get(name) === state.decls.get(name))) continue

        const covers = coveredBy(base, state, list)
        const covered = covers.some((cover) => {
          const sharing = sameNamed.filter((name) => cover.decls.has(name))

          if (sharing.length === 0) return false

          const winner = winnerOf([base, state, cover])

          return sharing.every((name) => cover.decls.get(name) === winner.decls.get(name))
        })

        if (covered) continue

        const classesShared = [...base.classes].filter((name) => state.classes.has(name))

        if (classesShared.length === 0 && !(loose && (base.classes.size === 0 || state.classes.size === 0))) continue

        found.push({ module, base: base.source, state: state.source, tie: order === 0, shared })
      }
    }
  }

  return found
}
