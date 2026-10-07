import { useTheme } from 'styled-components'
import { Rocket } from 'lucide-react'

import { Button, Card, Flex } from '@components/common/index.ts'
import { Centered, Description, Title } from './styles.ts'

import type { NextStepsProps } from './types.ts'

export const NextSteps = ({ onNavigate }: NextStepsProps) => {
  const theme = useTheme()

  return (
    <Card $variant="outlined">
      <Centered>
        <Rocket size={48} color={theme.colors.primary} />
        <Title>Pronto para começar?</Title>
        <Description>Agora que você conhece o básico, explore os componentes disponíveis e comece a construir sua aplicação!</Description>
        <Flex $gap="1rem" $wrap>
          <Button variant="primary" onClick={() => onNavigate('/components')} size="lg">
            Ver Componentes
          </Button>
          <Button variant="outline" onClick={() => onNavigate('/')} size="lg">
            Voltar para Home
          </Button>
        </Flex>
      </Centered>
    </Card>
  )
}

export default NextSteps
