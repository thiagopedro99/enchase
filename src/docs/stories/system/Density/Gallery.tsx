import { UIProvider, useUIConfig } from 'enchase'

import { Controls } from './Controls.tsx'
import { Surfaces } from './Surfaces.tsx'
import { Fields } from './Fields.tsx'
import { Bars } from './Bars.tsx'

export const DensityGallery = () => {
  const { labels, motion } = useUIConfig()

  return (
    <UIProvider labels={labels} motion={motion} navigate={() => undefined} currentHref="/docs">
      <div style={{ display: 'grid', gap: '2rem', maxInlineSize: '56rem', paddingBlockEnd: '2rem' }}>
        <Fields />
        <Controls />
        <Surfaces />
        <Bars />
      </div>
    </UIProvider>
  )
}
