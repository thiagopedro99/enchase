import { Accordion, Alert, Badge, Button, Layout, NumberInput, Pagination, RadioGroup, Switch, Table, Tabs, Textarea, ToastProvider } from 'enchase'

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
        <NumberInput label="Server amount" name="amount" defaultValue={12.5} min={0} formatOptions={{ style: 'currency', currency: 'USD' }} />
        <Pagination pageCount={9} defaultPage={4} />
        <Table caption="Server table" columns={[{ key: 'id', header: 'Order', rowHeader: true }, { key: 'total', header: 'Total', align: 'end' }]} rows={[{ id: '#1', total: 10 }, { id: '#2', total: 20 }]} />
        <Counter />
      </Layout>
    </ToastProvider>
  )
}
