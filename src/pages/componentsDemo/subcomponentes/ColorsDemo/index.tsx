import { useTheme } from 'styled-components'

import { GroupTitle, Groups, Swatch, SwatchGrid, SwatchName, SwatchValue } from './styles.ts'
import SectionBlock from '../SectionBlock/index.tsx'
import { colorGroups } from './defaultData.ts'

export const ColorsDemo = () => {
  const theme = useTheme()

  return (
    <SectionBlock id="cores" title="Cores" description="Paleta tonal por papéis. Cada cor de conteúdo (on*) é testada contra o seu fundo no tema claro e no escuro.">
      <Groups>
        {colorGroups.map((group) => (
          <div key={group.id}>
            <GroupTitle>{group.title}</GroupTitle>
            <SwatchGrid>
              {group.entries.map((entry) => (
                <Swatch key={entry.token} $background={theme.colors[entry.token]} $color={entry.on ? theme.colors[entry.on] : theme.colors.text.primary} $outline={!!entry.outline}>
                  <SwatchName>{entry.token}</SwatchName>
                  <SwatchValue>{theme.colors[entry.token]}</SwatchValue>
                </Swatch>
              ))}
            </SwatchGrid>
          </div>
        ))}
      </Groups>
    </SectionBlock>
  )
}

export default ColorsDemo
