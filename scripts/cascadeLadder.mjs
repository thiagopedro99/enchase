import selectorParser from 'postcss-selector-parser'

const K = 3
const BASE = 2
const LEGACY_PSEUDO_ELEMENTS = [':before', ':after', ':first-line', ':first-letter']
const SELECTOR_LISTS = [':is', ':-webkit-any', ':matches', ':any', ':not', ':has']
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

  const base = pe ? nodes.slice(0, -1) : nodes

  if (base.length > 0 && base[base.length - 1].type === 'combinator') throw new CascadeLadderError(`"${selector}" has a combinator before its pseudo-element`)

  const [a, b, c] = complexSpecificity(complex)

  if (a > 0) throw new CascadeLadderError(`"${selector}" has an id selector`)
  if (c >= K) throw new CascadeLadderError(`"${selector}" has c=${c}, and the ladder covers c < ${K}; rewrite the selector`)

  const n = ladderValue(b, c)
  const count = pe ? n - 1 : n
  const text = base.map((node) => String(node)).join('').trim() || '*'

  return `:where(${text}):not(${Array.from({ length: count }, () => '_').join(' ')})${pe}`
}

const cascadeLadder = () => ({
  postcssPlugin: 'enchase-cascade-ladder',
  Once(root) {
    const file = root.source?.input?.file ?? ''

    if (!LIBRARY_FILE.test(file)) return

    root.walkRules((rule) => {
      if (rule.parent?.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return

      rule.selectors = rule.selectors.map((selector) => ladderSelector(selector))
    })
  }
})

cascadeLadder.postcss = true

export default cascadeLadder
