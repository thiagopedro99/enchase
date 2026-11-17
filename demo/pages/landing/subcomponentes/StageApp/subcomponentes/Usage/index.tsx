import { Card, Progress, Tag } from 'enchase'

import { tags, usage } from './defaultData.ts'
import styles from './styles.module.css'

const Usage = () => (
  <Card
    variant="outlined"
    header="Uso do plano"
    headerExtra={
      <span className={styles.tags}>
        {tags.map((tag) => (
          <Tag key={tag} size="sm">
            {tag}
          </Tag>
        ))}
      </span>
    }
  >
    <ul className={styles.usage}>
      {usage.map(({ id, label, value, progress }) => (
        <li key={id} className={styles.row}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{value}</span>
          <Progress value={progress} size="sm" aria-label={label} className={styles.bar} />
        </li>
      ))}
    </ul>
  </Card>
)

export default Usage
