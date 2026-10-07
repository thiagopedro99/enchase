import { useTheme } from 'styled-components'
import { Rocket } from 'lucide-react'

import { Centered, Subtitle, Title } from './styles.ts'
import { Card } from '@components/common/index.ts'

export const Header = () => {
  const theme = useTheme()

  return (
    <Card>
      <Centered>
        <Rocket size={48} color={theme.colors.primary} />
        <Title>Guia de Início Rápido</Title>
        <Subtitle>Tudo que você precisa saber para começar a desenvolver com este template</Subtitle>
      </Centered>
    </Card>
  )
}

export default Header
