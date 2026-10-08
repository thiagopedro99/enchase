import { Settings } from 'lucide-react'

import { envCode, layoutTips, themeCode } from './defaultData.ts'
import HighlightedCode from '../HighlightedCode/index.tsx'
import SectionCard from '../SectionCard/index.tsx'
import { Flex } from '@components/common/index.ts'
import GuideList from '../GuideList/index.tsx'
import InfoBox from '../InfoBox/index.tsx'

export const Customization = () => (
  <SectionCard icon={Settings} title="4. Customização">
    <Flex direction="column" gap="2rem">
      <div>
        <h3>Modificar cores do tema</h3>
        <p>
          Edite os arquivos em <code>src/styles/themes/</code>:
        </p>
        <HighlightedCode code={themeCode} language="tsx" />
      </div>

      <div>
        <h3>Configurar variáveis de ambiente</h3>
        <p>
          Edite o arquivo <code>.env</code> na raiz do projeto:
        </p>
        <HighlightedCode code={envCode} language="bash" />
        <InfoBox $spaced>
          ⚠️ Lembre-se de adicionar <code>.env</code> no <code>.gitignore</code>
        </InfoBox>
      </div>

      <div>
        <h3>Personalizar o Layout</h3>
        <p>
          Modifique o componente Layout em <code>src/components/layout/</code> para:
        </p>
        <GuideList items={layoutTips} />
      </div>
    </Flex>
  </SectionCard>
)

export default Customization
