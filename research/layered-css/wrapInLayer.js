const STATEMENTS = new Set(['charset', 'import', 'namespace'])

export const wrapInLayer = (name = 'enchase') => ({
  postcssPlugin: 'enchase-wrap-in-layer',
  Once(root, { AtRule }) {
    const layer = new AtRule({ name: 'layer', params: name })
    const movable = root.nodes.filter((node) => !(node.type === 'atrule' && (STATEMENTS.has(node.name) || (node.name === 'layer' && !node.nodes))))
    if (movable.length === 0) return
    movable.forEach((node) => layer.append(node.remove()))
    root.append(layer)
  }
})
wrapInLayer.postcss = true
