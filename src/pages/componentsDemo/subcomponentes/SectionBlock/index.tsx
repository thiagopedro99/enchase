import { Code } from 'lucide-react'

import { DemoSection, HeaderText, SectionDescription, SectionHeader, SectionTitle } from './styles.ts'
import { Button, Card } from '@components/common/index.ts'

import type { SectionBlockProps } from './types.ts'

export const SectionBlock = ({ id, title, description, onShowCode, bare, children }: SectionBlockProps) => {
  const header = (
    <SectionHeader>
      <HeaderText>
        <SectionTitle>{title}</SectionTitle>
        {description && <SectionDescription>{description}</SectionDescription>}
      </HeaderText>
      {onShowCode && (
        <Button size="sm" variant="outline" onClick={onShowCode}>
          <Code size={16} /> Ver Código
        </Button>
      )}
    </SectionHeader>
  )

  return (
    <DemoSection id={id}>
      {bare ? (
        <>
          {header}
          {children}
        </>
      ) : (
        <Card>
          {header}
          {children}
        </Card>
      )}
    </DemoSection>
  )
}

export default SectionBlock
