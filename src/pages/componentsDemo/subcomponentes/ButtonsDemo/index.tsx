import { Button, Flex } from '@components/common/index.ts'
import { codeExamples } from '@utils/codeExamples.ts'
import SectionBlock from '../SectionBlock/index.tsx'
import { SizesRow } from './styles.ts'

import type { DemoSectionProps } from '../../types.ts'

export const ButtonsDemo = ({ onShowCode }: DemoSectionProps) => (
  <SectionBlock id="botoes" title="Botões" description="Quatro variantes em três tamanhos: preenchido, tonal, contorno e texto." onShowCode={() => onShowCode(codeExamples.button, 'Button')}>
    <Flex $gap="1rem" $wrap>
      <Button $variant="primary">Primary</Button>
      <Button $variant="secondary">Secondary</Button>
      <Button $variant="outline">Outline</Button>
      <Button $variant="ghost">Ghost</Button>
      <Button disabled>Disabled</Button>
    </Flex>

    <SizesRow>
      <Button $size="sm">Small</Button>
      <Button $size="md">Medium</Button>
      <Button $size="lg">Large</Button>
    </SizesRow>
  </SectionBlock>
)

export default ButtonsDemo
