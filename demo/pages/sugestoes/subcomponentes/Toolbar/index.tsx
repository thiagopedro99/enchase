import { Input, Select } from 'enchase'

import { kindOptions, sortOptions } from '../../defaultData.ts'
import styles from './styles.module.css'

import type { KindFilter, Sort } from '../../types.ts'
import type { ToolbarProps } from './types.ts'

const Toolbar = ({ filters, total, onFiltersChange }: ToolbarProps) => (
  <div className={styles.toolbar}>
    <Input type="search" label="Buscar sugestão" placeholder="Título, descrição ou componente" value={filters.query} onChange={({ target }) => onFiltersChange({ ...filters, query: target.value })} wrapperClassName={styles.search} />
    <Select label="Tipo" options={kindOptions} value={filters.kind} onChange={({ target }) => onFiltersChange({ ...filters, kind: target.value as KindFilter })} wrapperClassName={styles.select} />
    <Select label="Ordenar por" options={sortOptions} value={filters.sort} onChange={({ target }) => onFiltersChange({ ...filters, sort: target.value as Sort })} wrapperClassName={styles.select} />
    <p className={styles.total} role="status">
      {total === 1 ? '1 sugestão' : `${total} sugestões`}
    </p>
  </div>
)

export default Toolbar
