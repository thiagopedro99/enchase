import { Card, Grid } from '@components/common/index.ts'
import { codeExamples } from '@utils/codeExamples.ts'
import SectionBlock from '../SectionBlock/index.tsx'

import type { DemoSectionProps } from '../../types.ts'

export const CardsDemo = ({ onShowCode }: DemoSectionProps) => (
  <SectionBlock id="cards" title="Cards" description="Três variantes de superfície: preenchido, elevado e contornado." onShowCode={() => onShowCode(codeExamples.card, 'Card')} bare>
    <Grid columns={3} gap="1rem">
      <Card variant="default">
        <h3>Card Padrão</h3>
        <p>Sombra média com hover</p>
      </Card>
      <Card variant="elevated">
        <h3>Card Elevado</h3>
        <p>Sombra maior com animação</p>
      </Card>
      <Card variant="outlined">
        <h3>Card Outlined</h3>
        <p>Apenas borda</p>
      </Card>
    </Grid>
  </SectionBlock>
)

export default CardsDemo
