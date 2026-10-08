import { Flex, Skeleton } from '@components/common/index.ts'
import LabeledExample from '../LabeledExample/index.tsx'
import { codeExamples } from '@utils/codeExamples.ts'
import SectionBlock from '../SectionBlock/index.tsx'

import type { DemoSectionProps } from '../../types.ts'

export const SkeletonDemo = ({ onShowCode }: DemoSectionProps) => (
  <SectionBlock id="skeleton" title="Skeleton" description="Marcadores de carregamento com brilho suave, ocultos para leitores de tela." onShowCode={() => onShowCode(codeExamples.skeleton, 'Skeleton')}>
    <Flex direction="column" gap="2rem">
      <LabeledExample label="Texto:">
        <Flex direction="column" gap="0.5rem">
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
        </Flex>
      </LabeledExample>

      <LabeledExample label="Circular (Avatar):">
        <Flex gap="1rem">
          <Skeleton variant="circular" width="40px" />
          <Skeleton variant="circular" width="60px" />
          <Skeleton variant="circular" width="80px" />
        </Flex>
      </LabeledExample>

      <LabeledExample label="Retangular (Card/Image):">
        <Skeleton variant="rectangular" height="200px" />
      </LabeledExample>
    </Flex>
  </SectionBlock>
)

export default SkeletonDemo
