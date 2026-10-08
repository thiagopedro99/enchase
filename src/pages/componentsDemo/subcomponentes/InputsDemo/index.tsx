import { useState } from 'react'

import { Grid, Input } from '@components/common/index.ts'
import { codeExamples } from '@utils/codeExamples.ts'
import SectionBlock from '../SectionBlock/index.tsx'

import type { DemoSectionProps } from '../../types.ts'

export const InputsDemo = ({ onShowCode }: DemoSectionProps) => {
  const [inputValue, setInputValue] = useState('')

  return (
    <SectionBlock id="inputs" title="Inputs" description="Campos outlined com rótulo, ajuda e erro associados para tecnologia assistiva." onShowCode={() => onShowCode(codeExamples.input, 'Input')}>
      <Grid $columns={2} $gap="1rem">
        <Input label="Nome" placeholder="Digite seu nome" value={inputValue} onChange={(event) => setInputValue(event.target.value)} />
        <Input label="Email" type="email" placeholder="seu@email.com" helperText="Nunca compartilharemos seu email" />
        <Input label="Senha" type="password" placeholder="••••••••" />
        <Input label="Com erro" error="Este campo é obrigatório" placeholder="Campo com erro" />
        <Input label="Desabilitado" disabled placeholder="Campo desabilitado" />
        <Input label="Full Width" fullWidth placeholder="Campo de largura total" />
      </Grid>
    </SectionBlock>
  )
}

export default InputsDemo
