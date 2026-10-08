import { Card, Flex } from '@components/common/index.ts'
import LabeledExample from '../LabeledExample/index.tsx'
import { codeExamples } from '@utils/codeExamples.ts'
import SectionBlock from '../SectionBlock/index.tsx'

import type { DemoSectionProps } from '../../types.ts'

export const FlexDemo = ({ onShowCode }: DemoSectionProps) => (
  <SectionBlock id="flex" title="Flex (Layout)" description="Container flexível com direção, alinhamento, espaçamento e quebra por props." onShowCode={() => onShowCode(codeExamples.flex, 'Flex')}>
    <Flex direction="column" gap="1rem">
      <LabeledExample label="Horizontal (padrão):">
        <Flex gap="0.5rem">
          <Card padding="1rem">Item 1</Card>
          <Card padding="1rem">Item 2</Card>
          <Card padding="1rem">Item 3</Card>
        </Flex>
      </LabeledExample>

      <LabeledExample label="Vertical:">
        <Flex direction="column" gap="0.5rem">
          <Card padding="1rem">Item 1</Card>
          <Card padding="1rem">Item 2</Card>
          <Card padding="1rem">Item 3</Card>
        </Flex>
      </LabeledExample>
    </Flex>
  </SectionBlock>
)

export default FlexDemo
