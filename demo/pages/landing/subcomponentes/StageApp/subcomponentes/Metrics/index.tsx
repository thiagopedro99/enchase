import { Badge, Card, Progress } from 'enchase'

import { metrics } from './defaultData.ts'
import styles from './styles.module.css'

const Metrics = () => (
  <div className={styles.metrics}>
    {metrics.map(({ id, label, value, change, variant, progress }) => (
      <Card key={id} variant="outlined" className={styles.metric}>
        <span className={styles.label}>{label}</span>
        <span className={styles.row}>
          <span className={styles.value}>{value}</span>
          <Badge variant={variant} size="sm">
            {change}
          </Badge>
        </span>
        <Progress value={progress} size="sm" aria-label={label} />
      </Card>
    ))}
  </div>
)

export default Metrics
