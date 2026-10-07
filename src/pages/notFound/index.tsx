import { useNavigate } from 'react-router-dom'

import { CenteredContent, ErrorCode, Title, Message } from './styles.ts'
import { Button, Card, Container } from '@components/common/index.ts'
import { Flex } from '@components/common/index.ts'
import Layout from '@components/layout/index.tsx'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <Layout pageTitle="Página não encontrada">
      <Container $maxWidth="md">
        <CenteredContent>
          <ErrorCode>404</ErrorCode>

          <Card>
            <Flex $direction="column" $align="center" $gap="1.5rem">
              <Title>Página não encontrada</Title>

              <Message>Desculpe, a página que você está procurando não existe ou foi movida.</Message>

              <Flex $gap="1rem" $wrap>
                <Button variant="primary" onClick={() => navigate('/')}>
                  Voltar para Home
                </Button>

                <Button variant="outline" onClick={() => navigate(-1)}>
                  Voltar
                </Button>
              </Flex>
            </Flex>
          </Card>
        </CenteredContent>
      </Container>
    </Layout>
  )
}

export default NotFound
