import { useTheme } from 'styled-components'

import { Divider, Group, GroupTitle, RadiusSample, ShadowSample, Tile, Tiles, TokenLabel } from './styles.ts'
import { radiusTokens, shadowTokens } from './defaultData.ts'
import SectionBlock from '../SectionBlock/index.tsx'
import { lightTheme } from '@styles/themes/index.ts'

export const ShapeDemo = () => {
  const theme = useTheme()

  return (
    <SectionBlock id="forma-e-elevacao" title="Forma e elevação" description="Escala de cantos arredondados e níveis de sombra usados por botões, cards, diálogos e menus.">
      <Group>
        <GroupTitle>Raios (borderRadius)</GroupTitle>
        <Tiles>
          {radiusTokens.map((token) => (
            <Tile key={token}>
              <RadiusSample $radius={theme.borderRadius[token]} />
              <TokenLabel>
                {token} · {lightTheme.borderRadius[token]}
              </TokenLabel>
            </Tile>
          ))}
        </Tiles>
      </Group>

      <Divider />

      <Group>
        <GroupTitle>Elevação (shadows)</GroupTitle>
        <Tiles>
          {shadowTokens.map((token) => (
            <Tile key={token}>
              <ShadowSample $shadow={theme.shadows[token]} />
              <TokenLabel>{token}</TokenLabel>
            </Tile>
          ))}
        </Tiles>
      </Group>
    </SectionBlock>
  )
}

export default ShapeDemo
