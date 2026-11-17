import { Badge, Button, SegmentedControl, Switch } from 'enchase'

import { useRevealOrigin } from '../../../../useRevealOrigin.ts'
import { styleItems } from '../../../Playground/defaultData.ts'
import styles from './styles.module.css'

import type { LookStyle } from '../../../../types.ts'
import type { StylesDemoProps } from './types.ts'

const StylesDemo = ({ look, onLookChange }: StylesDemoProps) => {
  const { handlers, origin } = useRevealOrigin()

  return (
    <div className={styles.demo} {...handlers}>
      <SegmentedControl ariaLabel="Estilo visual da página" items={styleItems} value={look.style} onValueChange={(style: string) => onLookChange({ ...look, style: style as LookStyle }, origin())} size="sm" fullWidth />
      <div className={styles.preview}>
        <Button size="sm">Salvar</Button>
        <Button size="sm" variant="outline">
          Cancelar
        </Button>
        <Badge variant="success">No ar</Badge>
        <Switch label="Avisos" defaultChecked />
      </div>
    </div>
  )
}

export default StylesDemo
