import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'

const K = 3
const BASE = 2
const LEGACY_PSEUDO_ELEMENTS = [':before', ':after', ':first-line', ':first-letter']
const SELECTOR_LISTS = [':is', ':-webkit-any', ':matches', ':any', ':not', ':has']
const STATE_PSEUDO_CLASSES = [':hover', ':active', ':focus', ':focus-visible', ':focus-within', ':disabled', ':visited', ':checked']
const LIBRARY_FILE = /[\\/]src[\\/]components[\\/]/

export class CascadeLadderError extends Error {
  constructor(message) {
    super(`cascade ladder: ${message}`)
    this.name = 'CascadeLadderError'
  }
}

const isPseudoElement = (node) => node.type === 'pseudo' && (node.value.startsWith('::') || LEGACY_PSEUDO_ELEMENTS.includes(node.value))
const isWhere = (node) => node.type === 'pseudo' && node.value === ':where'
const isSelectorList = (node) => node.type === 'pseudo' && SELECTOR_LISTS.includes(node.value)
const isState = (node) => node.type === 'pseudo' && STATE_PSEUDO_CLASSES.includes(node.value)

const mostSpecific = (list) =>
  list.reduce((best, item) => (item[0] > best[0] || (item[0] === best[0] && (item[1] > best[1] || (item[1] === best[1] && item[2] > best[2]))) ? item : best), [0, 0, 0])

const complexSpecificity = (complex) => {
  let a = 0
  let b = 0
  let c = 0

  complex.each((node) => {
    if (node.type === 'nesting') throw new CascadeLadderError(`nesting (&) is not supported in "${String(complex).trim()}"`)
    if (node.type === 'id') a += 1
    else if (node.type === 'class' || node.type === 'attribute') b += 1
    else if (node.type === 'tag') c += 1
    else if (node.type === 'pseudo') {
      if (isPseudoElement(node)) c += 1
      else if (isSelectorList(node)) {
        const [argA, argB, argC] = mostSpecific(node.map(complexSpecificity))

        a += argA
        b += argB
        c += argC
      } else if (!isWhere(node)) b += 1
    }
  })

  return [a, b, c]
}

const parseOne = (selector) => {
  const roots = []

  selectorParser((root) => {
    roots.push(root)
  }).processSync(selector)

  const [root] = roots

  if (!root || root.nodes.length !== 1) throw new CascadeLadderError(`"${selector}" is not a single selector`)

  return root.nodes[0]
}

const subjectStart = (nodes) => nodes.reduce((start, node, index) => (node.type === 'combinator' ? index + 1 : start), 0)

const raisedIndex = (nodes) => {
  for (let index = subjectStart(nodes); index < nodes.length; index += 1) {
    if (isState(nodes[index])) return index
  }

  return -1
}

const IS_LISTS = [':is', ':matches', ':-webkit-any', ':any']

const isSingleStateList = (node) =>
  node.type === 'pseudo' &&
  IS_LISTS.includes(node.value) &&
  node.nodes.length > 0 &&
  node.nodes.every((selector) => selector.nodes.length === 1 && selector.nodes[0].type === 'pseudo' && selector.nodes[0].nodes.length === 0 && !isPseudoElement(selector.nodes[0])) &&
  node.nodes.some((selector) => isState(selector.nodes[0]))

export const specificityOf = (selector) => complexSpecificity(parseOne(selector))

export const ladderValue = (b, c) => {
  if (c >= K) throw new CascadeLadderError(`c=${c} is outside the ladder, which covers c < ${K}`)

  return BASE + K * b + c
}

export const ladderSelector = (selector) => {
  const complex = parseOne(selector)
  const nodes = []

  complex.each((node) => {
    nodes.push(node)
  })

  if (nodes.length === 0) throw new CascadeLadderError(`"${selector}" is empty`)
  if (nodes[0].type === 'combinator') throw new CascadeLadderError(`"${selector}" starts with a combinator`)

  const last = nodes[nodes.length - 1]
  const pe = isPseudoElement(last) ? String(last) : ''
  const pseudoElements = nodes.filter(isPseudoElement).length

  if (pseudoElements > (pe ? 1 : 0)) throw new CascadeLadderError(`"${selector}" has a pseudo-element before its end`)

  const body = pe ? nodes.slice(0, -1) : nodes
  const raised = raisedIndex(body)
  const state = raised === -1 ? '' : String(body[raised])
  const base = body.filter((_, index) => index !== raised)
  const trailing = base.length > 0 && base[base.length - 1].type === 'combinator'

  if (trailing && raised === -1) throw new CascadeLadderError(`"${selector}" has a combinator before its pseudo-element`)

  const [a, b, c] = complexSpecificity(complex)

  if (a > 0) throw new CascadeLadderError(`"${selector}" has an id selector`)
  if (c >= K) throw new CascadeLadderError(`"${selector}" has c=${c}, and the ladder covers c < ${K}; rewrite the selector`)

  const n = ladderValue(b, c)
  const count = pe ? n - 1 : n
  const joined = base.map((node) => String(node)).join('').trim()
  const text = trailing ? `${joined} *` : joined || '*'

  return `:where(${text}):not(${Array.from({ length: count }, () => '_').join(' ')})${state}${pe}`
}

const isPlaceholder = (node) =>
  node.type === 'pseudo' &&
  node.value === ':not' &&
  node.nodes.length > 0 &&
  node.nodes.every((selector) => selector.nodes.length > 0 && selector.nodes.every((part) => part.type === 'combinator' || (part.type === 'tag' && part.value === '_')))

const onTheLadder = (selector) => {
  const nodes = []

  parseOne(selector).each((node) => {
    nodes.push(node)
  })

  const last = nodes.length - 1
  const shaped = nodes.every((node, index) => isWhere(node) || isPlaceholder(node) || isState(node) || (isPseudoElement(node) && index === last))
  const states = nodes.filter(isState).length
  const [a, b, c] = specificityOf(selector)

  return shaped && states <= 1 && a === 0 && b === states && c >= BASE
}

export const ladderSelectors = (selector) => {
  const complex = parseOne(selector)
  const nodes = []

  complex.each((node) => {
    nodes.push(node)
  })

  const from = subjectStart(nodes)
  const index = nodes.findIndex((node, position) => position >= from && isSingleStateList(node))

  if (index === -1) return [ladderSelector(selector)]

  return nodes[index].nodes.flatMap((alternative) => {
    const text = nodes.map((node, position) => (position === index ? String(alternative.nodes[0]).trim() : String(node))).join('')

    return ladderSelectors(text)
  })
}

export const ladderProblems = (css) => {
  const problems = []

  postcss.parse(css).walkRules((rule) => {
    if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return

    for (const selector of rule.selectors) {
      if (!onTheLadder(selector)) problems.push(selector)
    }
  })

  return problems
}

const cascadeLadder = () => ({
  postcssPlugin: 'enchase-cascade-ladder',
  Once(root) {
    const file = root.source?.input?.file ?? ''

    if (!LIBRARY_FILE.test(file)) return

    root.walkRules((rule) => {
      if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return

      rule.selectors = rule.selectors.flatMap((selector) => ladderSelectors(selector))
    })
  }
})

cascadeLadder.postcss = true

export default cascadeLadder
