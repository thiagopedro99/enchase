import { Navbar, Sidebar } from 'enchase'

import { navigationSections } from './defaultData.ts'
import { Section } from './Section.tsx'

export const Bars = () => (
  <Section title="Bars and navigation">
    <div style={{ border: '1px solid var(--enchase-color-border)' }}>
      <Navbar logo="Enchase" sections={navigationSections} />
    </div>
    <div style={{ display: 'flex', border: '1px solid var(--enchase-color-border)' }}>
      <Sidebar ariaLabel="Sidebar navigation" sections={navigationSections} currentHref="/docs" header={<strong>Enchase</strong>} style={{ blockSize: '20rem' }} />
    </div>
  </Section>
)
