import { BookOpen } from 'lucide-react'

import { technologyEntries } from './defaultData.ts'
import SectionCard from '../SectionCard/index.tsx'
import { TechnologyList } from './styles.ts'

export const Technologies = () => (
  <SectionCard icon={BookOpen} title="Tecnologias Utilizadas">
    <TechnologyList>
      {technologyEntries.map((technology) => (
        <p key={technology.name}>
          • <strong>{technology.name}</strong> - {technology.description}
        </p>
      ))}
    </TechnologyList>
  </SectionCard>
)

export default Technologies
