import { useState } from 'react'

import { Checkbox, Flex } from '@components/common/index.ts'
import { codeExamples } from '@utils/codeExamples.ts'
import SectionBlock from '../SectionBlock/index.tsx'

import type { DemoSectionProps } from '../../types.ts'

export const CheckboxDemo = ({ onShowCode }: DemoSectionProps) => {
  const [checked, setChecked] = useState(false)

  return (
    <SectionBlock id="checkbox" title="Checkbox" description="Controle nativo com estado visual por CSS, alvo de 40px e foco visível." onShowCode={() => onShowCode(codeExamples.checkbox, 'Checkbox')}>
      <Flex $direction="column" $gap="0.5rem" $align="start">
        <Checkbox label="Aceito os termos e condições" checked={checked} onChange={(event) => setChecked(event.target.checked)} />
        <Checkbox label="Deseja receber novidades?" />
        <Checkbox label="Opção desabilitada" disabled />
        <Checkbox label="Marcado e desabilitado" checked disabled />
      </Flex>
    </SectionBlock>
  )
}

export default CheckboxDemo
