import { Folder } from 'lucide-react'

import { FolderItem, FolderTree, Intro } from './styles.ts'
import SectionCard from '../SectionCard/index.tsx'
import { folderEntries } from './defaultData.ts'

export const ProjectStructure = () => (
  <SectionCard icon={Folder} title="2. Estrutura do Projeto">
    <Intro>O projeto segue uma estrutura organizada e escalável:</Intro>
    <FolderTree>
      {folderEntries.map((entry) => (
        <FolderItem key={entry.label} $level={entry.level}>
          {entry.label}
        </FolderItem>
      ))}
    </FolderTree>
  </SectionCard>
)

export default ProjectStructure
