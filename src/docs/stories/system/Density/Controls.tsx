import { Badge, Button, Checkbox, Pagination, RadioGroup, SegmentedControl, Slider, Switch, Tag } from 'enchase'

import { planOptions, segments } from './defaultData.ts'
import { Section } from './Section.tsx'

const row = { display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' } as const

export const Controls = () => (
  <Section title="Buttons and controls">
    <div style={row}>
      <Button size="sm">Small</Button>
      <Button>Medium</Button>
      <Button size="lg">Large</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Tag onRemove={() => undefined}>Tag</Tag>
      <Badge>New</Badge>
    </div>
    <div style={row}>
      <SegmentedControl size="sm" ariaLabel="Small view" items={segments} defaultValue="list" />
      <SegmentedControl ariaLabel="View" items={segments} defaultValue="list" />
      <SegmentedControl size="lg" ariaLabel="Large view" items={segments} defaultValue="board" />
    </div>
    <div style={{ ...row, alignItems: 'start', gap: '2rem' }}>
      <div style={{ display: 'grid' }}>
        <Checkbox label="Receive updates" defaultChecked />
        <Switch label="Notifications" defaultChecked />
      </div>
      <RadioGroup label="Plan" options={planOptions} defaultValue="pro" />
      <Slider label="Volume" showValue defaultValue={40} />
    </div>
    <div style={row}>
      <Pagination pageCount={5} defaultPage={2} />
      <Pagination size="sm" ariaLabel="Small pagination" pageCount={5} defaultPage={2} />
    </div>
  </Section>
)
