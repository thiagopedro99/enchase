import { Card, Tabs } from 'enchase'

import FeedbackDemo from './subcomponentes/FeedbackDemo/index.tsx'
import FormDemo from './subcomponentes/FormDemo/index.tsx'
import DataDemo from './subcomponentes/DataDemo/index.tsx'
import styles from './styles.module.css'

import type { TabsProps } from 'enchase'

const items: TabsProps['items'] = [
  { value: 'form', label: 'Formulário', content: <FormDemo /> },
  { value: 'data', label: 'Dados', content: <DataDemo /> },
  { value: 'feedback', label: 'Avisos e diálogos', content: <FeedbackDemo /> }
]

const Showcase = () => (
  <Card className={styles.showcase}>
    <Tabs items={items} ariaLabel="Exemplos de componentes" />
  </Card>
)

export default Showcase
