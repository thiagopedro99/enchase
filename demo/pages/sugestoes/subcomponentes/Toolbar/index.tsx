import { Button, ButtonLink, Input, Select } from 'enchase'

import { kindOptions, sortOptions } from '../../defaultData.ts'
import { suggestUrl } from '../../../../defaultData.ts'
import styles from './styles.module.css'

import type { KindFilter, Sort } from '../../types.ts'
import type { ToolbarProps } from './types.ts'

const Toolbar = ({ filters, total, onFiltersChange, onSuggest }: ToolbarProps) => (
  <div className={styles.toolbar}>
    <Input type="search" label="Buscar sugestão" placeholder="Título, descrição ou componente" value={filters.query} onChange={({ target }) => onFiltersChange({ ...filters, query: target.value })} wrapperClassName={styles.search} />
    <Select label="Tipo" options={kindOptions} value={filters.kind} onChange={({ target }) => onFiltersChange({ ...filters, kind: target.value as KindFilter })} wrapperClassName={styles.select} fullWidth />
    <Select label="Ordenar por" options={sortOptions} value={filters.sort} onChange={({ target }) => onFiltersChange({ ...filters, sort: target.value as Sort })} wrapperClassName={styles.select} fullWidth />
    <p className={styles.total} role="status">
      {total === 1 ? '1 sugestão' : `${total} sugestões`}
    </p>
    {onSuggest ? (
      <Button className={styles.suggest} onClick={onSuggest}>
        Sugerir
      </Button>
    ) : (
      <ButtonLink href={suggestUrl} target="_blank" className={styles.suggest}>
        Sugerir no GitHub
      </ButtonLink>
    )}
  </div>
)

export default Toolbar
