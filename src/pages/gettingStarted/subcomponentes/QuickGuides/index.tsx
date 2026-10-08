import { Code } from 'lucide-react'

import { apiCode, componentsCode, pageComponentCode, pageRouteCode, pageStructureCode, storeCode, toastCode } from './defaultData.ts'
import HighlightedCode from '../HighlightedCode/index.tsx'
import SectionCard from '../SectionCard/index.tsx'
import { Flex } from '@components/common/index.ts'
import GuideList from '../GuideList/index.tsx'
import InfoBox from '../InfoBox/index.tsx'
import { InlineLink } from './styles.ts'

import type { QuickGuidesProps } from './types.ts'

export const QuickGuides = ({ onNavigate }: QuickGuidesProps) => (
  <SectionCard icon={Code} title="3. Guias Rápidos">
    <Flex direction="column" gap="2rem">
      <div>
        <h3>Como criar uma nova página</h3>
        <GuideList
          items={[
            <>
              <strong>1.</strong> Crie uma pasta em <code>src/pages/</code>
              <HighlightedCode code={pageStructureCode} language="bash" />
            </>,
            <>
              <strong>2.</strong> Crie o componente:
              <HighlightedCode code={pageComponentCode} language="tsx" />
            </>,
            <>
              <strong>3.</strong> Adicione a rota em <code>src/routes/routes.tsx</code>:
              <HighlightedCode code={pageRouteCode} language="tsx" />
            </>
          ]}
        />
      </div>

      <div>
        <h3>Como usar os componentes</h3>
        <HighlightedCode code={componentsCode} language="tsx" />
        <InfoBox $spaced>
          💡 Veja todos os componentes disponíveis na página <InlineLink type="button" onClick={() => onNavigate('/components')}>Components Demo</InlineLink>
        </InfoBox>
      </div>

      <div>
        <h3>Como gerenciar estado global (Zustand)</h3>
        <HighlightedCode code={storeCode} language="tsx" />
      </div>

      <div>
        <h3>Como fazer chamadas de API (Actions)</h3>
        <HighlightedCode code={apiCode} language="tsx" />
      </div>

      <div>
        <h3>Como usar notificações (Toast)</h3>
        <HighlightedCode code={toastCode} language="tsx" />
      </div>
    </Flex>
  </SectionCard>
)

export default QuickGuides
