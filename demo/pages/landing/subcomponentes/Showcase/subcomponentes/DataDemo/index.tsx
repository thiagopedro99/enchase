import { Avatar, Badge, Progress, Table } from 'enchase'

import { projects, statuses } from './defaultData.ts'
import styles from './styles.module.css'

import type { TableColumn } from 'enchase'
import type { Project } from './types.ts'

const columns: TableColumn<Project>[] = [
  { key: 'name', header: 'Projeto', rowHeader: true },
  { key: 'status', header: 'Situação', cell: ({ status }) => <Badge variant={statuses[status].variant}>{statuses[status].label}</Badge> },
  { key: 'progress', header: 'Progresso', width: '12rem', cell: ({ name, progress }) => <Progress value={progress} size="sm" showValue aria-label={`Progresso de ${name}`} /> },
  {
    key: 'owner',
    header: 'Responsável',
    cell: ({ owner }) => (
      <span className={styles.owner}>
        <Avatar name={owner} size="sm" aria-hidden="true" />
        {owner}
      </span>
    )
  }
]

const DataDemo = () => (
  <div className={styles.data}>
    <Table columns={columns} rows={projects} getRowKey={({ id }) => id} caption="Projetos em andamento" />
  </div>
)

export default DataDemo
