import { useState } from 'react'

import MultiCodeBlock from '@components/common/MultiCodeBlock/index.tsx'
import BreadcrumbsDemo from './subcomponentes/BreadcrumbsDemo/index.tsx'
import TypographyDemo from './subcomponentes/TypographyDemo/index.tsx'
import CheckboxDemo from './subcomponentes/CheckboxDemo/index.tsx'
import SkeletonDemo from './subcomponentes/SkeletonDemo/index.tsx'
import ButtonsDemo from './subcomponentes/ButtonsDemo/index.tsx'
import LoadingDemo from './subcomponentes/LoadingDemo/index.tsx'
import SidebarDemo from './subcomponentes/SidebarDemo/index.tsx'
import PageHeader from './subcomponentes/PageHeader/index.tsx'
import SelectDemo from './subcomponentes/SelectDemo/index.tsx'
import InputsDemo from './subcomponentes/InputsDemo/index.tsx'
import ColorsDemo from './subcomponentes/ColorsDemo/index.tsx'
import ModalsDemo from './subcomponentes/ModalsDemo/index.tsx'
import ToastsDemo from './subcomponentes/ToastsDemo/index.tsx'
import ShapeDemo from './subcomponentes/ShapeDemo/index.tsx'
import CardsDemo from './subcomponentes/CardsDemo/index.tsx'
import { pageSections, sectionIds } from './defaultData.ts'
import GridDemo from './subcomponentes/GridDemo/index.tsx'
import FlexDemo from './subcomponentes/FlexDemo/index.tsx'
import { Flex, Modal } from '@components/common/index.ts'
import { useScrollSpy } from '@hooks/useScrollSpy.ts'
import Layout from '@components/layout/index.tsx'

import type { CodeBlock, ShowCodeHandler } from './types.ts'

const ComponentsDemo = () => {
  const [codeModalOpen, setCodeModalOpen] = useState(false)
  const [currentCodeBlocks, setCurrentCodeBlocks] = useState<CodeBlock[]>([])
  const [currentCodeTitle, setCurrentCodeTitle] = useState('')
  const activeSectionId = useScrollSpy(sectionIds)

  const showCode: ShowCodeHandler = (blocks, title) => {
    setCurrentCodeBlocks(blocks)
    setCurrentCodeTitle(title)
    setCodeModalOpen(true)
  }

  return (
    <Layout pageTitle="Demo de Componentes" pageSections={pageSections} activePageSectionId={activeSectionId}>
      <Flex $direction="column" $gap="2rem">
        <PageHeader />
        <ColorsDemo />
        <TypographyDemo />
        <ShapeDemo />
        <ButtonsDemo onShowCode={showCode} />
        <InputsDemo onShowCode={showCode} />
        <SelectDemo onShowCode={showCode} />
        <CheckboxDemo onShowCode={showCode} />
        <ModalsDemo onShowCode={showCode} />
        <LoadingDemo onShowCode={showCode} />
        <CardsDemo onShowCode={showCode} />
        <ToastsDemo onShowCode={showCode} />
        <SkeletonDemo onShowCode={showCode} />
        <SidebarDemo onShowCode={showCode} />
        <BreadcrumbsDemo onShowCode={showCode} />
        <FlexDemo onShowCode={showCode} />
        <GridDemo onShowCode={showCode} />
      </Flex>

      <Modal isOpen={codeModalOpen} onClose={() => setCodeModalOpen(false)} title={`Código: ${currentCodeTitle}`} size="lg">
        <MultiCodeBlock blocks={currentCodeBlocks} />
      </Modal>
    </Layout>
  )
}

export default ComponentsDemo
