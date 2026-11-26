import { Alert, Avatar, Badge, Button, ButtonLink, Drawer, Link, Textarea } from 'enchase'
import { useId, useState } from 'react'

import { commentMessages, kindLabels, statuses, votable } from '../../defaultData.ts'
import { checkComment, commentLimits } from '../../comment.ts'
import { loginUrl, sendComment } from '../../account.ts'
import VoteButton from '../VoteButton/index.tsx'
import StatusDot from '../StatusDot/index.tsx'
import { useVoting } from '../../voting.ts'
import styles from './styles.module.css'
import { useThread } from './useThread.ts'
import { ageOf } from '../../columns.ts'

import type { SuggestionPanelProps } from './types.ts'
import type { CommentFailure } from '../../types.ts'
import type { FormEvent } from 'react'

const SuggestionPanel = ({ id, suggestion, account, onClose, onCommented, onSignedOut }: SuggestionPanelProps) => {
  const { state, append } = useThread(id)
  const { mode, voted, deltas, pending, onVote } = useVoting()
  const [text, setText] = useState('')
  const [failure, setFailure] = useState<CommentFailure | null>(null)
  const [sending, setSending] = useState(false)
  const headingId = useId()
  const thread = state.status === 'ready' ? state.thread : undefined
  const status = statuses.find(({ value }) => value === suggestion?.status)
  const votes = suggestion ? Math.max(0, suggestion.votes + (deltas[suggestion.id] ?? 0)) : 0

  const submit = async (event: FormEvent) => {
    event.preventDefault()

    const checked = checkComment({ text })

    if (sending || id === null) return
    if (!checked.ok) return setFailure('invalid')

    setSending(true)
    setFailure(null)

    const result = await sendComment(id, checked.text)

    setSending(false)

    if (result.status === 'signedOut') onSignedOut()
    if (result.status !== 'ok') return setFailure(result.status)

    setText('')
    append(result.comment)

    if (suggestion) onCommented({ ...suggestion, comments: suggestion.comments + 1 })
  }

  return (
    <Drawer open={id !== null} onClose={onClose} title={thread?.title ?? suggestion?.title ?? 'Sugestão'} side="end" size="lg">
      <div className={styles.panel}>
        {suggestion && status && (
          <p className={styles.meta}>
            <span className={styles.status}>
              <StatusDot status={status.value} />
              {status.label}
            </span>
            <span>{kindLabels[suggestion.kind]}</span>
            {suggestion.version && (
              <Badge variant="success" size="sm">
                Lançado na {suggestion.version}
              </Badge>
            )}
          </p>
        )}

        {state.status === 'loading' && (
          <p className={styles.note} role="status">
            Carregando a sugestão…
          </p>
        )}
        {state.status === 'missing' && <Alert variant="warning" title="Esta sugestão não está no quadro">Ela pode ter sido fechada ou removida.</Alert>}
        {state.status === 'error' && (
          <Alert variant="error" title="Não foi possível carregar os comentários">
            Tente de novo em instantes, ou veja a sugestão no GitHub.
          </Alert>
        )}

        {thread && (
          <>
            {thread.text && <p className={styles.text}>{thread.text}</p>}

            <div className={styles.actions}>
              {suggestion && mode !== 'off' && votable.includes(suggestion.status) && (
                <VoteButton title={suggestion.title} votes={votes} voted={voted.includes(suggestion.id)} signed={mode === 'signed'} pending={pending.includes(suggestion.id)} onVote={() => onVote(suggestion)} />
              )}
              <Link href={thread.url} target="_blank">
                Ver no GitHub
              </Link>
            </div>

            <section className={styles.comments} aria-labelledby={headingId}>
              <h3 id={headingId} className={styles.heading}>
                Comentários <span className={styles.count}>{thread.total}</span>
              </h3>

              {thread.comments.length === 0 && <p className={styles.note}>Ainda não há comentários. Conte como você usaria isso.</p>}
              {thread.total > thread.comments.length && thread.comments.length > 0 && <p className={styles.note}>Mostrando os {thread.comments.length} mais recentes que estão visíveis.</p>}

              {thread.comments.length > 0 && (
                <ol className={styles.list}>
                  {thread.comments.map(({ id: commentId, author, avatarUrl, text: body, createdAt, maintainer }) => (
                    <li key={commentId} className={styles.comment}>
                      <Avatar size="sm" name={author} className={styles.avatar} {...(avatarUrl ? { src: avatarUrl } : {})} />
                      <div className={styles.body}>
                        <p className={styles.byline}>
                          <strong className={styles.author}>@{author}</strong>
                          {maintainer && <Badge size="sm">Mantenedor</Badge>}
                          <time dateTime={createdAt} className={styles.time}>
                            {ageOf(createdAt)}
                          </time>
                        </p>
                        <p className={styles.text}>{body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}

              {thread.locked && <p className={styles.note}>{commentMessages.locked}</p>}

              {!thread.locked && account.status === 'signed' && (
                <form className={styles.form} noValidate onSubmit={submit}>
                  {failure && (
                    <Alert variant="error" title="O comentário não foi enviado">
                      {commentMessages[failure]}
                    </Alert>
                  )}
                  <Textarea name="comment" label="Seu comentário" fullWidth rows={3} maxLength={commentLimits.max} value={text} onChange={({ target }) => setText(target.value)} helperText="Vira um comentário público na issue do GitHub, com o seu usuário." />
                  <Button type="submit" className={styles.send} {...(sending ? { 'aria-busy': true, 'aria-disabled': true } : {})}>
                    {sending ? 'Enviando…' : 'Comentar'}
                  </Button>
                </form>
              )}

              {!thread.locked && account.status !== 'signed' && (
                <div className={styles.form}>
                  {failure === 'signedOut' && (
                    <Alert variant="error" title="O comentário não foi enviado">
                      {commentMessages.signedOut}
                    </Alert>
                  )}
                  <p className={styles.note}>Entre com o GitHub para comentar sem sair do site.</p>
                  <ButtonLink href={loginUrl} native variant="outline" size="sm" className={styles.send}>
                    Entrar com GitHub
                  </ButtonLink>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </Drawer>
  )
}

export default SuggestionPanel
