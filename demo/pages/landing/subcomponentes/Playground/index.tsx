import { Card, Container, SegmentedControl, Switch } from 'enchase'

import CodeBlock from '../../../../components/CodeBlock/index.tsx'
import { brands, defaultBrand } from '../../defaultData.ts'
import { shapeItems, snippetOf } from './defaultData.ts'
import SectionHeading from '../SectionHeading/index.tsx'
import StylePicker from '../StylePicker/index.tsx'
import Showcase from '../Showcase/index.tsx'
import styles from './styles.module.css'

import type { Look, LookShape } from '../../types.ts'
import type { PlaygroundProps } from './types.ts'
import type { CSSProperties } from 'react'

const brandItems = brands.map(({ value, label }) => ({
  value,
  ariaLabel: label,
  label: <span className={styles.swatch} data-auto={value === defaultBrand ? '' : undefined} style={{ '--swatch-color': value } as CSSProperties} />
}))

const Playground = ({ look, onLookChange }: PlaygroundProps) => {
  const change = (patch: Partial<Look>) => onLookChange({ ...look, ...patch })

  return (
    <section id="playground" className={styles.section} aria-labelledby="playground-title">
      <Container maxWidth="xl" className={styles.content}>
        <SectionHeading
          id="playground-title"
          eyebrow="Ao vivo"
          title="Um kit, quatro visuais. Troque agora."
          lead="Os controles mudam o tema desta página inteira: estilo, cor da marca, cantos e densidade. É o mesmo tema que você passa ao seu app."
        />

        <div className={styles.grid}>
          <Card variant="outlined" className={styles.controls}>
            <StylePicker name="Estilo" value={look.style} onChange={(style) => change({ style })} labelled />
            <SegmentedControl label="Cor da marca" items={brandItems} value={look.brand} onValueChange={(brand: string) => change({ brand })} size="sm" fullWidth />
            <SegmentedControl label="Cantos" items={shapeItems} value={look.shape} onValueChange={(shape: string) => change({ shape: shape as LookShape })} size="sm" fullWidth />
            <Switch label="Densidade compacta" helperText="Controles e espaços menores, para telas de trabalho." checked={look.compact} onChange={(event) => change({ compact: event.target.checked })} />
            <CodeBlock label="O tema que você está vendo" language="tsx" code={snippetOf(look)} copy />
          </Card>

          <Showcase />
        </div>
      </Container>
    </section>
  )
}

export default Playground
