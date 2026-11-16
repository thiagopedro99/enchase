import { defaultBrand } from '../../defaultData.ts'

import type { SegmentedControlItem } from 'enchase'
import type { Look } from '../../types.ts'

export const styleItems: SegmentedControlItem[] = [
  { value: 'enchase', label: 'Enchase' },
  { value: 'shadcn', label: 'shadcn' },
  { value: 'workbench', label: 'Workbench' }
]

export const brands = [
  { value: defaultBrand, label: 'A do estilo' },
  { value: '#0F766E', label: 'Verde' },
  { value: '#BE123C', label: 'Carmim' },
  { value: '#B45309', label: 'Âmbar' }
]

export const shapeItems: SegmentedControlItem[] = [
  { value: 'auto', label: 'Padrão' },
  { value: 'pill', label: 'Pílula' },
  { value: 'soft', label: 'Suave' },
  { value: 'square', label: 'Reto' }
]

export const snippetOf = ({ style, brand, shape, compact }: Look) => {
  const custom = style !== 'enchase'
  const entries = [custom ? `style: ${style}` : '', brand === defaultBrand ? '' : `brand: '${brand}'`, shape === 'auto' ? '' : `shape: '${shape}'`].filter(Boolean)
  const provider = entries.length > 0 ? ['<ColorModeProvider', '  theme={{', entries.map((entry) => `    ${entry}`).join(',\n'), '  }}', '>'] : ['<ColorModeProvider>']
  const imports = ["import { ColorModeProvider } from 'enchase'", ...(custom ? [`import { ${style} } from 'enchase/styles/${style}'`] : [])]
  const density = compact ? ['<html data-density="compact">', ''] : []

  return [...imports, '', ...density, ...provider, '  <App />', '</ColorModeProvider>'].join('\n')
}
