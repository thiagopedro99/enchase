import { Package } from 'lucide-react'

import { Highlight, StepContainer, StepNote, StepNumber } from './styles.ts'
import HighlightedCode from '../HighlightedCode/index.tsx'
import SectionCard from '../SectionCard/index.tsx'
import InfoBox from '../InfoBox/index.tsx'

export const Installation = () => (
  <SectionCard icon={Package} title="1. Instalação">
    <StepContainer>
      <StepNumber>1</StepNumber>
      <div>
        <h3>Clone ou baixe o template</h3>
        <HighlightedCode
          code={`git clone seu-repositorio.git meu-projeto
cd meu-projeto`}
          language="bash"
        />
      </div>
    </StepContainer>

    <StepContainer>
      <StepNumber>2</StepNumber>
      <div>
        <h3>Instale as dependências</h3>
        <HighlightedCode code="npm install" language="bash" />
        <StepNote>
          Ou use yarn: <code>yarn install</code>
        </StepNote>
      </div>
    </StepContainer>

    <StepContainer>
      <StepNumber>3</StepNumber>
      <div>
        <h3>Configure as variáveis de ambiente</h3>
        <HighlightedCode code="cp .env.example .env" language="bash" />
        <StepNote>
          Edite o arquivo <code>.env</code> com suas configurações
        </StepNote>
      </div>
    </StepContainer>

    <StepContainer>
      <StepNumber>4</StepNumber>
      <div>
        <h3>Inicie o servidor de desenvolvimento</h3>
        <HighlightedCode code="npm run dev" language="bash" />
        <InfoBox>
          ✨ O projeto estará rodando em <Highlight>http://localhost:5173</Highlight>
        </InfoBox>
      </div>
    </StepContainer>
  </SectionCard>
)

export default Installation
