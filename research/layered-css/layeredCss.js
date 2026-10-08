import postcss from 'postcss'
import { wrapInLayer } from './wrapInLayer.js'

export const layeredCss = ({ layer = 'enchase', suffix = '.layer.css' } = {}) => ({
  name: 'enchase-layered-css',
  apply: 'build',
  enforce: 'post',
  async generateBundle(_, bundle) {
    const cssAssets = Object.values(bundle).filter((file) => file.type === 'asset' && file.fileName.endsWith('.css') && !file.fileName.endsWith(suffix))
    for (const asset of cssAssets) {
      const source = typeof asset.source === 'string' ? asset.source : new TextDecoder().decode(asset.source)
      const result = await postcss([wrapInLayer(layer)]).process(source, { from: asset.fileName, to: asset.fileName.replace(/\.css$/, suffix) })
      this.emitFile({ type: 'asset', fileName: asset.fileName.replace(/\.css$/, suffix), source: result.css })
    }
  }
})
