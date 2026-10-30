import type { ReactNode } from 'react'

type SectionProps = { title: string; children: ReactNode }

export const Section = ({ title, children }: SectionProps) => (
  <section style={{ display: 'grid', gap: '0.75rem', alignContent: 'start' }}>
    <h2 style={{ margin: 0, fontSize: '1rem' }}>{title}</h2>
    {children}
  </section>
)
