export const pageStructureCode = `src/pages/minhaPage/
  ├── index.tsx
  ├── styles.ts
  └── subcomponentes/
      └── Header/
          ├── index.tsx
          ├── styles.ts
          └── types.ts`

export const pageComponentCode = `import Layout from '@components/layout/index.tsx'

const MinhaPage = () => {
  return (
    <Layout pageTitle="Minha Página">
      <h1>Conteúdo da página</h1>
    </Layout>
  )
}

export default MinhaPage`

export const pageRouteCode = `import MinhaPage from '@pages/minhaPage/index.tsx'

const routes = [
  {
    path: '/',
    privateRoute: false,
    routes: [
      // ... outras rotas
      ['/minha-page', <MinhaPage />],
    ],
  },
]`

export const componentsCode = `import { Button, Card, Input, Modal } from '@components/common/index.ts'

const MeuComponente = () => {
  return (
    <Card>
      <Input label="Nome" />
      <Button>Enviar</Button>
    </Card>
  )
}`

export const storeCode = `import { useAppStore } from '@stores/app/index.ts'

const MeuComponente = () => {
  const theme = useAppStore((state) => state.theme)
  const toggleTheme = useAppStore((state) => state.toggleTheme)

  return (
    <button onClick={toggleTheme}>
      Tema atual: {theme}
    </button>
  )
}`

export const apiCode = `// src/actions/users/index.ts
import { api } from '../api.ts'

import type { CreateUserInput, User } from './types.ts'

export const listUsers = async (): Promise<User[]> => {
  const { data } = await api.get<User[]>('/users')

  return data
}

export const createUser = async (payload: CreateUserInput): Promise<User> => {
  const { data } = await api.post<User>('/users', payload)

  return data
}`

export const toastCode = `import { useToast } from '@components/toast/index.ts'

const MeuComponente = () => {
  const toast = useToast()

  const handleClick = () => {
    toast.success('Operação realizada com sucesso!')
    // toast.error('Erro ao realizar operação')
    // toast.warning('Atenção!')
    // toast.info('Informação importante')
  }

  return <button onClick={handleClick}>Mostrar Toast</button>
}`
