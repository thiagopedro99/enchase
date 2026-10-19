import { Accordion, Alert, Badge, Button, Layout, RadioGroup, Switch, Tabs, Textarea, ToastProvider } from 'enchase'

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
        <Switch label="Server switch" defaultChecked />
        <RadioGroup label="Server plan" defaultValue="free" options={[{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }]} />
        <Tabs ariaLabel="Server tabs" items={[{ value: 'a', label: 'One', content: <p>First</p> }, { value: 'b', label: 'Two', content: <p>Second</p> }]} />
        <Accordion items={[{ value: 'a', title: 'Server accordion', content: <p>Hidden until opened</p> }]} />
        <Counter />
      </Layout>
    </ToastProvider>
  )
}
