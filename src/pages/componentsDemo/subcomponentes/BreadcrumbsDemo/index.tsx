import Breadcrumbs from '@components/common/Breadcrumbs/index.tsx'
import { longTrail, shortTrail } from './defaultData.ts'
import LabeledExample from '../LabeledExample/index.tsx'
import { codeExamples } from '@utils/codeExamples.ts'
import SectionBlock from '../SectionBlock/index.tsx'
import { Flex } from '@components/common/index.ts'

import type { DemoSectionProps } from '../../types.ts'

export const BreadcrumbsDemo = ({ onShowCode }: DemoSectionProps) => (
  <SectionBlock
    id="breadcrumbs"
    title="Breadcrumbs"
    description="Trilha de navegação que mostra onde a pessoa está. A trilha longa colapsa o meio e o último item é a página atual."
    onShowCode={() => onShowCode(codeExamples.breadcrumbs, 'Breadcrumbs')}
  >
    <Flex $direction="column" $gap="1.5rem">
      <LabeledExample label="Trilha curta:">
        <Breadcrumbs items={shortTrail} ariaLabel="Exemplo de trilha curta" />
      </LabeledExample>

      <LabeledExample label="Trilha longa (colapsada, ative a reticências para expandir):">
        <Breadcrumbs items={longTrail} maxItems={4} ariaLabel="Exemplo de trilha longa" />
      </LabeledExample>
    </Flex>
  </SectionBlock>
)

export default BreadcrumbsDemo
