import { Badge, CardLink, Tag, VisuallyHidden } from 'enchase'
import { useId } from 'react'

import { CommentIcon, ThumbsUpIcon } from '../../../../components/icons.tsx'
import { kindLabels } from '../../defaultData.ts'
import styles from './styles.module.css'
import { ageOf } from '../../columns.ts'

import type { SuggestionCardProps } from './types.ts'

const count = (value: number, one: string, many: string) => `${value} ${value === 1 ? one : many}`

const details = (votes: number, comments: number, id: number) => `${count(votes, 'voto', 'votos')}, ${count(comments, 'comentário', 'comentários')}, issue ${id}`

const SuggestionCard = ({ suggestion: { id, url, title, text, kind, area, votes, comments, createdAt, version, reason } }: SuggestionCardProps) => {
  const titleId = useId()
  const detailsId = useId()

  return (
    <li>
      <CardLink href={url} target="_blank" variant="outlined" padding="0" className={styles.card} aria-labelledby={titleId} aria-describedby={detailsId}>
        <span className={styles.meta}>
          <span className={styles.kind} data-kind={kind}>
            {kindLabels[kind]}
          </span>
          <span className={styles.age}>{ageOf(createdAt)}</span>
        </span>
        <span id={titleId} className={styles.title}>
          {title}
        </span>
        {text && <span className={styles.text}>{text}</span>}
        {reason && (
          <span className={styles.reason}>
            <span className={styles.reasonLabel}>Motivo</span>
            {reason}
          </span>
        )}
        {(area || version) && (
          <span className={styles.labels}>
            {area && <Tag size="sm">{area}</Tag>}
            {version && (
              <Badge variant="success" size="sm">
                Lançado na {version}
              </Badge>
            )}
          </span>
        )}
        <span className={styles.footer} aria-hidden="true">
          <span className={styles.votes}>
            <ThumbsUpIcon size={14} />
            {votes}
          </span>
          <span className={styles.comments}>
            <CommentIcon size={14} />
            {comments}
          </span>
          <span className={styles.number}>#{id}</span>
        </span>
        <VisuallyHidden id={detailsId}>{details(votes, comments, id)}</VisuallyHidden>
      </CardLink>
    </li>
  )
}

export default SuggestionCard
