import { ButtonLink, Container, Flex } from '@components/common/index.ts'
import { docsUrl } from '@components/layout/defaultData.ts'
import { repositoryUrl } from './defaultData.ts'
import Layout from '@components/layout/index.tsx'
import styles from './styles.module.css'

const Home = () => (
  <Layout pageTitle="Início" centered>
    <Container maxWidth="lg">
      <Flex direction="column" align="center" gap="2rem">
        <div className={styles.hero}>
          <img src="/enchase-marca.svg" alt="" className={styles.logo} />
          <h1 className={styles.title}>Bem-vindo ao Enchase</h1>
          <p className={styles.subtitle}>Componentes React acessíveis e configuráveis, prontos para usar</p>
        </div>

        <Flex gap="1rem" wrap>
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
