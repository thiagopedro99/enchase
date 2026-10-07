import { useTheme } from 'styled-components'

import { Sample, ScaleList, ScaleMeta, ScaleRole, ScaleRow, ScaleToken, WeightRow } from './styles.ts'
import { typeScale, weights } from './defaultData.ts'
import SectionBlock from '../SectionBlock/index.tsx'

export const TypographyDemo = () => {
  const theme = useTheme()

  return (
    <SectionBlock id="tipografia" title="Tipografia" description="Escala tipográfica em Figtree, com títulos em peso médio e corpo em peso regular.">
      <ScaleList>
        {typeScale.map((entry) => (
          <ScaleRow key={entry.token}>
            <ScaleMeta>
              <ScaleRole>{entry.role}</ScaleRole>
              <ScaleToken>
                {entry.token} · {theme.fonts.sizes[entry.token]}
              </ScaleToken>
            </ScaleMeta>
            <Sample $size={theme.fonts.sizes[entry.token]}>{entry.sample}</Sample>
          </ScaleRow>
        ))}
      </ScaleList>

      <WeightRow>
        {weights.map((weight) => (
          <Sample key={weight} $size={theme.fonts.sizes.xl} $weight={theme.fonts.weights[weight]}>
            {weight} {theme.fonts.weights[weight]}
          </Sample>
        ))}
      </WeightRow>
    </SectionBlock>
  )
}

export default TypographyDemo
