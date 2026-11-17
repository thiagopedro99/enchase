import { Avatar, Breadcrumbs, Button } from 'enchase'
import { PlusIcon } from 'enchase/icons'

import { account, navigation, product, team, trail } from './defaultData.tsx'
import Composer from './subcomponentes/Composer/index.tsx'
import Metrics from './subcomponentes/Metrics/index.tsx'
import Deploys from './subcomponentes/Deploys/index.tsx'
import Usage from './subcomponentes/Usage/index.tsx'
import { GemIcon } from '../../icons.tsx'
import styles from './styles.module.css'

const StageApp = () => (
  <div className={styles.app}>
    <div className={styles.rail}>
      <span className={styles.product}>
        <span className={styles.mark}>
          <GemIcon size={16} />
        </span>
        {product}
      </span>

      <ul className={styles.navigation}>
        {navigation.map(({ id, label, icon, current }) => (
          <li key={id} className={styles.item} data-current={current ? '' : undefined}>
            {icon}
            {label}
          </li>
        ))}
      </ul>

      <span className={styles.account}>
        <Avatar name={account.name} size="sm" />
        <span className={styles.person}>
          <span className={styles.name}>{account.name}</span>
          <span className={styles.role}>{account.role}</span>
        </span>
      </span>
    </div>

    <div className={styles.main}>
      <div className={styles.bar}>
        <Breadcrumbs items={trail} />
        <span className={styles.actions}>
          <span className={styles.team}>
            {team.map((member) => (
              <Avatar key={member} name={member} size="sm" />
            ))}
          </span>
          <Button size="sm">
            <PlusIcon size={16} />
            Novo deploy
          </Button>
        </span>
      </div>

      <Metrics />

      <div className={styles.columns}>
        <div className={styles.stack}>
          <Deploys />
          <Usage />
        </div>
        <Composer />
      </div>
    </div>
  </div>
)

export default StageApp
