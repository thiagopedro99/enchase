import { useNavigate } from 'react-router-dom'

import ProjectStructure from './subcomponentes/ProjectStructure/index.tsx'
import Customization from './subcomponentes/Customization/index.tsx'
import Technologies from './subcomponentes/Technologies/index.tsx'
import Installation from './subcomponentes/Installation/index.tsx'
import QuickGuides from './subcomponentes/QuickGuides/index.tsx'
import NextSteps from './subcomponentes/NextSteps/index.tsx'
import Commands from './subcomponentes/Commands/index.tsx'
import Header from './subcomponentes/Header/index.tsx'
import { Flex } from '@components/common/index.ts'
import Layout from '@components/layout/index.tsx'

const GettingStarted = () => {
  const navigate = useNavigate()

  return (
    <Layout pageTitle="Getting Started - Guia de Início">
      <Flex direction="column" gap="2rem">
        <Header />
        <Installation />
        <ProjectStructure />
        <QuickGuides onNavigate={navigate} />
        <Customization />
        <Commands />
        <Technologies />
        <NextSteps onNavigate={navigate} />
      </Flex>
    </Layout>
  )
}

export default GettingStarted
