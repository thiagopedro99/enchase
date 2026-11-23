import { Switch } from 'enchase'

import { anchorOf } from '../../defaultData.ts'
import styles from './styles.module.css'

import type { VersionIndexProps } from './types.ts'

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' })

const VersionIndex = ({ releases, activeId, onlyBehavior, onOnlyBehaviorChange }: VersionIndexProps) => (
  <aside className={styles.aside} aria-label="Versões">
    <Switch label="Só as que mudam comportamento" checked={onlyBehavior} onChange={({ target }) => onOnlyBehaviorChange(target.checked)} />

    <ol className={styles.index}>
      {releases.map(({ version, shortDate, title, behavior }) => (
        <li key={version}>
          <button type="button" className={styles.jump} aria-current={activeId === anchorOf(version) ? 'true' : undefined} onClick={() => jump(anchorOf(version))}>
            <span className={styles.version}>
              {version}
              {behavior && <span className={styles.mark} role="img" aria-label="muda comportamento" />}
            </span>
            <span className={styles.title}>{title}</span>
            <span className={styles.date}>{shortDate}</span>
          </button>
        </li>
      ))}
    </ol>

    <p className={styles.legend}>
      <span className={styles.mark} aria-hidden="true" />
      Muda comportamento
    </p>
  </aside>
)

export default VersionIndex
