import { useNavigate } from 'react-router-dom'

import { Button, Card, Container } from '@components/common/index.ts'
import { Flex } from '@components/common/index.ts'
import Layout from '@components/layout/index.tsx'
import styles from './styles.module.css'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <Layout pageTitle="Página não encontrada">
      <Container maxWidth="md">
        <div className={styles.centeredContent}>
          <h1 className={styles.errorCode}>404</h1>

          <Card>
            <Flex direction="column" align="center" gap="1.5rem">
              <h2 className={styles.title}>Página não encontrada</h2>

              <p className={styles.message}>Desculpe, a página que você está procurando não existe ou foi movida.</p>

              <Flex gap="1rem" wrap>
                <Button variant="primary" onClick={() => navigate('/')}>
                  Voltar para Home
                </Button>

                <Button variant="outline" onClick={() => navigate(-1)}>
                  Voltar
                </Button>
              </Flex>
            </Flex>
          </Card>
        </div>
      </Container>
    </Layout>
  )
}

export default NotFound
