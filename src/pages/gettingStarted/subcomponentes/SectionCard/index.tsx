import { useTheme } from 'styled-components'

import { Section, SectionHeader, SectionTitle } from './styles.ts'
import { Card } from '@components/common/index.ts'

import type { SectionCardProps } from './types.ts'

export const SectionCard = ({ icon: Icon, title, children }: SectionCardProps) => {
  const theme = useTheme()

  return (
    <Section>
      <Card>
        <SectionHeader>
          <Icon size={24} color={theme.colors.primary} />
          <SectionTitle>{title}</SectionTitle>
        </SectionHeader>
        {children}
      </Card>
    </Section>
  )
}

export default SectionCard
