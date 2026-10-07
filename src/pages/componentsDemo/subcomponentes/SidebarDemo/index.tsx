import { useState } from 'react'

import { Sidebar } from '@components/common/Sidebar/index.tsx'
import { codeExamples } from '@utils/codeExamples.ts'
import SectionBlock from '../SectionBlock/index.tsx'
import { Frame, FramePreview } from './styles.ts'
import { demoSections } from './defaultData.ts'

import type { DemoSectionProps } from '../../types.ts'

export const SidebarDemo = ({ onShowCode }: DemoSectionProps) => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <SectionBlock
      id="sidebar"
      title="Sidebar"
      description="Menu lateral permanente que recolhe para uma barra de ícones e vira um drawer modal em telas pequenas."
      onShowCode={() => onShowCode(codeExamples.sidebar, 'Sidebar')}
    >
      <Frame>
        <Sidebar
          sections={demoSections}
          activeId="inicio"
          header={<strong>Aurora</strong>}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((current) => !current)}
          ariaLabel="Exemplo de menu lateral"
        />
        <FramePreview>Use o botão no rodapé do menu para recolher e expandir.</FramePreview>
      </Frame>
    </SectionBlock>
  )
}

export default SidebarDemo
