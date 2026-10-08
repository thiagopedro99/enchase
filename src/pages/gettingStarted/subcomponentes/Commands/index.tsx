import { FileCode } from 'lucide-react'

import HighlightedCode from '../HighlightedCode/index.tsx'
import SectionCard from '../SectionCard/index.tsx'
import { Flex } from '@components/common/index.ts'
import { commandEntries } from './defaultData.ts'

export const Commands = () => (
  <SectionCard icon={FileCode} title="5. Comandos Úteis">
    <Flex direction="column" gap="1rem">
      {commandEntries.map((entry) => (
        <div key={entry.command}>
          <strong>{entry.label}</strong>
          <HighlightedCode code={entry.command} language="bash" />
        </div>
      ))}
    </Flex>
  </SectionCard>
)

export default Commands
