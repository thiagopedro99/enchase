import { Alert, Button, Card, Input, Select, Slider, Switch } from 'enchase'

import { defaultInstances, defaultRegion, regions } from './defaultData.ts'
import styles from './styles.module.css'

const Composer = () => (
  <div className={styles.composer}>
    <Card variant="elevated" header="Novo serviço" >
      <div className={styles.form}>
        <Input label="Nome" defaultValue="atlas-fila" fullWidth />
        <Select label="Região" options={regions} defaultValue={defaultRegion} fullWidth />
        <Slider label="Instâncias" min={1} max={8} defaultValue={defaultInstances} showValue />
        <Switch label="Deploy automático" defaultChecked />
        <span className={styles.actions}>
          <Button variant="ghost" size="sm">
            Cancelar
          </Button>
          <Button size="sm">Criar serviço</Button>
        </span>
      </div>
    </Card>

    <Alert variant="success" title="atlas-web no ar">
      Publicado há 2 minutos, sem erros.
    </Alert>
  </div>
)

export default Composer
