import { Badge, Button, Switch } from 'enchase'

import { useRevealOrigin } from '../../../../useRevealOrigin.ts'
import StylePicker from '../../../StylePicker/index.tsx'
import styles from './styles.module.css'

import type { StylesDemoProps } from './types.ts'

const StylesDemo = ({ look, onLookChange }: StylesDemoProps) => {
  const { handlers, origin } = useRevealOrigin()

  return (
    <div className={styles.demo} {...handlers}>
      <StylePicker name="Estilo visual da página" value={look.style} onChange={(style) => onLookChange({ ...look, style }, origin())} size="sm" />
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
