import { Avatar, Badge, Card, SegmentedControl, Table } from 'enchase'

import { defaultPeriod, deploys, periods, statuses } from './defaultData.ts'
import styles from './styles.module.css'

import type { TableColumn } from 'enchase'
import type { Deploy } from './types.ts'

const columns: TableColumn<Deploy>[] = [
  { key: 'name', header: 'Serviço', rowHeader: true, cell: ({ name }) => <span className={styles.name}>{name}</span> },
  { key: 'branch', header: 'Branch', cell: ({ branch }) => <code className={styles.branch}>{branch}</code> },
  { key: 'status', header: 'Situação', cell: ({ status }) => <Badge variant={statuses[status].variant}>{statuses[status].label}</Badge> },
  { key: 'author', header: 'Autoria', cell: ({ author }) => <Avatar name={author} size="sm" /> }
]

const Deploys = () => (
  <Card
    variant="outlined"
    className={styles.deploys}
    header={<span className={styles.name}>Deploys recentes</span>}
    headerExtra={
      <span className={styles.period}>
        <SegmentedControl items={periods} defaultValue={defaultPeriod} ariaLabel="Período" size="sm" />
      </span>
    }
  >
    <Table columns={columns} rows={deploys} getRowKey={({ id }) => id} ariaLabel="Deploys recentes" size="sm" />
  </Card>
)

export default Deploys
