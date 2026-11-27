import { Badge, Link, Tag, VisuallyHidden } from 'enchase'
import { useId } from 'react'

import { CommentIcon, ThumbsUpIcon } from '../../../../components/icons.tsx'
import { issueParameter, kindLabels, votable } from '../../defaultData.ts'
import VoteButton from '../VoteButton/index.tsx'
import { useVoting } from '../../voting.ts'
import styles from './styles.module.css'
import { ageOf } from '../../columns.ts'

import type { SuggestionCardProps } from './types.ts'
import type { MouseEvent } from 'react'

const count = (value: number, one: string, many: string) => `${value} ${value === 1 ? one : many}`

const details = (votes: number, comments: number, id: number) => `${count(votes, 'voto', 'votos')}, ${count(comments, 'comentário', 'comentários')}, issue ${id}`

const plain = ({ button, metaKey, ctrlKey, shiftKey, altKey }: MouseEvent) => button === 0 && !metaKey && !ctrlKey && !shiftKey && !altKey

const SuggestionCard = ({ suggestion }: SuggestionCardProps) => {
  const { id, url, title, text, kind, area, comments, status, createdAt, version, reason } = suggestion
  const { mode, voted, deltas, pending, onVote, onOpen } = useVoting()
  const titleId = useId()
  const detailsId = useId()
  const votes = Math.max(0, suggestion.votes + (deltas[id] ?? 0))
  const canVote = mode !== 'off' && votable.includes(status)

  return (
    <div className={styles.card}>
      <span className={styles.meta}>
        <span className={styles.kind} data-kind={kind}>
          {kindLabels[kind]}
        </span>
        <span className={styles.age}>{ageOf(createdAt)}</span>
      </span>
      {onOpen ? (
        <a href={`?${issueParameter}=${id}`} className={styles.title} aria-labelledby={titleId} aria-describedby={detailsId} onClick={(event) => plain(event) && (event.preventDefault(), onOpen(id))}>
          <span id={titleId}>{title}</span>
        </a>
      ) : (
        <Link href={url} target="_blank" className={styles.title} aria-labelledby={titleId} aria-describedby={detailsId}>
          <span id={titleId}>{title}</span>
        </Link>
      )}
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
      <span className={styles.footer}>
        {canVote ? (
          <VoteButton title={title} votes={votes} voted={voted.includes(id)} signed={mode === 'signed'} pending={pending.includes(id)} onVote={() => onVote(suggestion)} />
        ) : (
          <span className={styles.votes} aria-hidden="true">
            <ThumbsUpIcon size={14} />
            {votes}
          </span>
        )}
        {onOpen ? (
          <button type="button" className={styles.open} aria-label={`Ver ${count(comments, 'comentário', 'comentários')} de ${title}`} onClick={() => onOpen(id)}>
            <CommentIcon size={14} />
            {comments}
          </button>
        ) : (
          <span className={styles.comments} aria-hidden="true">
            <CommentIcon size={14} />
            {comments}
          </span>
        )}
        <span className={styles.number} aria-hidden="true">
          #{id}
        </span>
      </span>
      <VisuallyHidden id={detailsId}>{details(votes, comments, id)}</VisuallyHidden>
    </div>
  )
}

export default SuggestionCard
