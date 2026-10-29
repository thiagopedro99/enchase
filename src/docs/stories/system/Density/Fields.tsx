import { Combobox, DatePicker, Input, NumberInput, Select, Textarea } from 'enchase'

import { fruitOptions, planOptions } from './defaultData.ts'
import { Section } from './Section.tsx'

export const Fields = () => (
  <Section title="Fields">
    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))', alignItems: 'start' }}>
      <Input label="Name" helperText="As it is on your card." />
      <Input label="Password" type="password" passwordToggle defaultValue="secret" />
      <Select label="Plan" options={planOptions} defaultValue="pro" />
      <NumberInput label="Seats" defaultValue={3} min={0} />
      <DatePicker label="Start date" />
      <Combobox label="Fruit" options={fruitOptions} />
      <Textarea label="Notes" />
    </div>
  </Section>
)
