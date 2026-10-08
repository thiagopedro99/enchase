import { Card, Flex, Grid } from '@components/common/index.ts'
import LabeledExample from '../LabeledExample/index.tsx'
import { codeExamples } from '@utils/codeExamples.ts'
import SectionBlock from '../SectionBlock/index.tsx'

import type { DemoSectionProps } from '../../types.ts'

export const GridDemo = ({ onShowCode }: DemoSectionProps) => (
  <SectionBlock id="grid" title="Grid (Layout)" description="Grade de colunas iguais com espaçamento configurável." onShowCode={() => onShowCode(codeExamples.grid, 'Grid')}>
    <Flex $direction="column" $gap="1.5rem">
      <LabeledExample label="2 Colunas:">
        <Grid $columns={2} $gap="0.5rem">
          <Card padding="1rem">Item 1</Card>
          <Card padding="1rem">Item 2</Card>
          <Card padding="1rem">Item 3</Card>
          <Card padding="1rem">Item 4</Card>
        </Grid>
      </LabeledExample>

      <LabeledExample label="3 Colunas:">
        <Grid $columns={3} $gap="0.5rem">
          <Card padding="1rem">Item 1</Card>
          <Card padding="1rem">Item 2</Card>
          <Card padding="1rem">Item 3</Card>
        </Grid>
      </LabeledExample>
    </Flex>
  </SectionBlock>
)

export default GridDemo
