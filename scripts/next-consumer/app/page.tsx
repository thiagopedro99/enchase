import { Alert, Badge, Button, Layout, Textarea, ToastProvider } from 'enchase'

import Counter from './counter'

const sections = [{ id: 'main', items: [{ id: 'home', label: 'Home', href: '/' }] }]

export default function Page() {
  return (
    <ToastProvider>
      <Layout pageTitle="Home" brand="Next consumer" navigationSections={sections}>
        <h1>Server component page</h1>
        <Button>Rendered on the server</Button>
        <Badge variant="success">Server badge</Badge>
        <Alert variant="warning" title="Server alert">
          Rendered without client code
        </Alert>
        <Textarea label="Server textarea" />
        <Counter />
      </Layout>
    </ToastProvider>
  )
}
