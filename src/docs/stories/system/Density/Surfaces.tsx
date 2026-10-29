import { Accordion, Alert, Breadcrumbs, Card, Table, Tabs } from 'enchase'

import { accordionItems, breadcrumbItems, tabItems, tableColumns, tableRows } from './defaultData.ts'
import { Section } from './Section.tsx'

export const Surfaces = () => (
  <Section title="Content">
    <Tabs ariaLabel="Settings" items={tabItems} />
    <Accordion items={accordionItems} />
    <Table caption="Orders" columns={tableColumns} rows={tableRows} />
    <Alert variant="info" title="Heads up">
      The padding of the alert follows the space scale.
    </Alert>
    <Card variant="outlined">A card takes its padding from the space scale.</Card>
    <Breadcrumbs items={breadcrumbItems} />
  </Section>
)
