import type { ReactNode } from 'react'

type DemoProps = { title: string; hint: string; children: ReactNode }

export const Demo = ({ title, hint, children }: DemoProps) => (
  <section style={{ display: 'grid', gap: '0.75rem', alignContent: 'start', padding: '1rem', border: '1px solid var(--enchase-color-outline-variant)', borderRadius: '0.75rem' }}>
    <h3 style={{ margin: 0, fontSize: '1rem' }}>{title}</h3>
    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--enchase-color-text-secondary)' }}>{hint}</p>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>{children}</div>
  </section>
)
