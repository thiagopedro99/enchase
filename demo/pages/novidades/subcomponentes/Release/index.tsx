import { Badge, Link } from 'enchase'

import CodeBlock from '../../../../components/CodeBlock/index.tsx'
import { anchorOf, groupLabels } from '../../defaultData.ts'
import { repositoryUrl } from '../../../../defaultData.ts'
import styles from './styles.module.css'
import { rich } from '../../rich.tsx'

import type { ReleaseBlock } from '../../types.ts'
import type { ReleaseProps } from './types.ts'

const longLine = 30

const sideBySide = (blocks: ReleaseBlock[]) => blocks.length === 2 && blocks.every(({ code }) => code.split('\n').every((line) => line.length <= longLine))

const Release = ({ release: { version, previous, date, title, summary, behavior, groups, migration } }: ReleaseProps) => {
  const id = anchorOf(version)

  return (
    <article id={id} className={styles.release} aria-labelledby={`${id}-title`}>
      <div className={styles.rail}>
        <p className={styles.version}>{version}</p>
        <p className={styles.date}>{date}</p>
      </div>

      <div className={styles.body}>
        <Badge variant={behavior ? 'warning' : 'neutral'} size="sm">
          {behavior ? 'Muda comportamento' : 'Sem mudança de comportamento'}
        </Badge>
        <h2 id={`${id}-title`} className={styles.title}>
          {title}
        </h2>
        <p className={styles.summary}>{rich(summary)}</p>

        {groups.map(({ kind, items }) => (
          <div key={kind} className={styles.group}>
            <Badge variant={groupLabels[kind].variant} size="sm">
              {groupLabels[kind].label}
            </Badge>
            <ul className={styles.items}>
              {items.map((item) => (
                <li key={item}>{rich(item)}</li>
              ))}
            </ul>
          </div>
        ))}

        {migration && (
          <div className={styles.migration}>
            <h3 className={styles.migrationTitle}>Como migrar</h3>
            <p className={styles.migrationText}>{rich(migration.text)}</p>
            <div className={styles.blocks} data-pair={sideBySide(migration.blocks) ? '' : undefined}>
              {migration.blocks.map(({ label, language, code }) => (
                <CodeBlock key={label} label={label} language={language} code={code} />
              ))}
            </div>
          </div>
        )}

        <p className={styles.links}>
          <Link href={`${repositoryUrl}/compare/v${previous}...v${version}`} target="_blank">
            Comparar com a {previous}
          </Link>
          <Link href={`${repositoryUrl}/releases/tag/v${version}`} target="_blank">
            Notas técnicas da {version}
          </Link>
        </p>
      </div>
    </article>
  )
}

export default Release
