import { useState } from 'react'

import { Button, Flex, InlineLoading, Loading } from '@components/common/index.ts'
import LabeledExample from '../LabeledExample/index.tsx'
import { codeExamples } from '@utils/codeExamples.ts'
import { useToast } from '@components/toast/index.ts'
import SectionBlock from '../SectionBlock/index.tsx'

import type { DemoSectionProps } from '../../types.ts'

export const LoadingDemo = ({ onShowCode }: DemoSectionProps) => {
  const toast = useToast()
  const [loadingOverlay, setLoadingOverlay] = useState(false)

  const handleLoadingDemo = () => {
    setLoadingOverlay(true)
    setTimeout(() => {
      setLoadingOverlay(false)
      toast.success('Carregamento concluído!')
    }, 2000)
  }

  return (
    <SectionBlock id="loading" title="Loading" description="Indicadores de progresso com status anunciado e movimento reduzido respeitado." onShowCode={() => onShowCode(codeExamples.loading, 'Loading')}>
      <Flex gap="2rem" wrap align="center">
        <LabeledExample label="Tamanhos:">
          <Flex gap="1rem" align="center">
            <Loading size="xs" />
            <Loading size="sm" />
            <Loading size="md" />
            <Loading size="lg" />
          </Flex>
        </LabeledExample>

        <LabeledExample label="Com texto:">
          <Loading size="md" text="Carregando..." />
        </LabeledExample>

        <div>
          <Button>
            Botão <InlineLoading /> Carregando
          </Button>
        </div>

        <div>
          <Button onClick={handleLoadingDemo}>Testar Loading Overlay</Button>
        </div>
      </Flex>

      {loadingOverlay && <Loading overlay text="Processando..." />}
    </SectionBlock>
  )
}

export default LoadingDemo
