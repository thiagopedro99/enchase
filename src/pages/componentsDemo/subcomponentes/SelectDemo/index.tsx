import { useState } from 'react'

import { choiceOptions, errorOptions } from './defaultData.ts'
import { Grid, Select } from '@components/common/index.ts'
import { codeExamples } from '@utils/codeExamples.ts'
import SectionBlock from '../SectionBlock/index.tsx'

import type { DemoSectionProps } from '../../types.ts'

export const SelectDemo = ({ onShowCode }: DemoSectionProps) => {
  const [selectValue, setSelectValue] = useState('')

  return (
    <SectionBlock id="select" title="Select" description="Seleção nativa estilizada, com a mesma anatomia dos campos de texto." onShowCode={() => onShowCode(codeExamples.select, 'Select')}>
      <Grid columns={2} gap="1rem">
        <Select
          label="Escolha uma opção"
          placeholder="Selecione..."
          value={selectValue}
          onChange={(event) => setSelectValue(event.target.value)}
          options={choiceOptions}
        />
        <Select label="Com erro" error="Selecione uma opção" options={errorOptions} />
      </Grid>
    </SectionBlock>
  )
}

export default SelectDemo
