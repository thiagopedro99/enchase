import { ButtonLink, Container, Flex } from '@components/common/index.ts'
import { Hero, Logo, Title, Subtitle } from './styles.ts'
import { docsUrl } from '@components/layout/defaultData.ts'
import { repositoryUrl } from './defaultData.ts'
import Layout from '@components/layout/index.tsx'

const Home = () => (
  <Layout pageTitle="Início" centered>
    <Container $maxWidth="lg">
      <Flex $direction="column" $align="center" $gap="2rem">
        <Hero>
          <Logo src="/enchase-marca.svg" alt="" />
          <Title>Bem-vindo ao Enchase</Title>
          <Subtitle>Componentes React acessíveis e configuráveis, prontos para usar</Subtitle>
        </Hero>

        <Flex $gap="1rem" $wrap>
          <ButtonLink href={docsUrl} size="lg">
            Começar
          </ButtonLink>
          <ButtonLink href={repositoryUrl} target="_blank" variant="outline" size="lg">
            Repositório
          </ButtonLink>
        </Flex>
      </Flex>
    </Container>
  </Layout>
)

export default Home
