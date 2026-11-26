import { Alert, Button, ButtonLink, Input, Link, Modal, RadioGroup, Textarea } from 'enchase'
import { useId, useMemo, useRef, useState } from 'react'

import { draftKinds, draftLabels, draftMessage, sendMessages } from '../../defaultData.ts'
import { rememberIntent } from '../../intent.ts'
import { checkDraft, dailySuggestions, draftLimits } from '../../draft.ts'
import { loginUrl, sendSuggestion } from '../../account.ts'
import { similarTo } from './similar.ts'
import styles from './styles.module.css'
import { useDraft } from './useDraft.ts'

import type { DraftField, DraftProblem, DraftProblems } from '../../draft.ts'
import type { Kind, SendFailure } from '../../types.ts'
import type { SuggestDialogProps } from './types.ts'
import type { FormEvent } from 'react'

const order: DraftField[] = ['title', 'need', 'proposal']

const problemsOf = (found: Record<string, string>): DraftProblems => Object.fromEntries(order.flatMap((field) => (found[field] ? [[field, found[field] as DraftProblem]] : [])))

const SuggestDialog = ({ isOpen, items, onClose, onSent, onSignedOut }: SuggestDialogProps) => {
  const { draft, change, clear } = useDraft()
  const [problems, setProblems] = useState<DraftProblems>({})
  const [failure, setFailure] = useState<SendFailure | null>(null)
  const [sending, setSending] = useState(false)
  const form = useRef<HTMLFormElement>(null)
  const formId = useId()
  const similar = useMemo(() => similarTo(draft.title, items), [draft.title, items])
  const labels = draftLabels[draft.kind]

  const errorOf = (field: DraftField) => (problems[field] ? draftMessage(field, problems[field]) : undefined)

  const edit = (field: DraftField, value: string) => {
    change({ [field]: value })
    setProblems((current) => ({ ...current, [field]: undefined }))
  }

  const reject = (found: DraftProblems) => {
    const first = order.find((field) => found[field])

    setProblems(found)
    form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()

    const checked = checkDraft(draft)

    if (sending) return
    if (!checked.ok) return reject(checked.problems)

    setSending(true)
    setFailure(null)

    const result = await sendSuggestion(checked.draft)

    setSending(false)

    if (result.status === 'invalid') return reject(problemsOf(result.problems))
    if (result.status === 'signedOut') onSignedOut()
    if (result.status !== 'ok') return setFailure(result.status)

    clear()
    setProblems({})
    onSent(result.suggestion, result.listed)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sugerir"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} {...(sending ? { 'aria-busy': true, 'aria-disabled': true } : {})}>
            {sending ? 'Enviando…' : 'Enviar sugestão'}
          </Button>
        </>
      }
    >
      <form ref={form} id={formId} className={styles.form} noValidate onSubmit={submit}>
        {failure && (
          <Alert variant="error" title="A sugestão não foi enviada">
            <p className={styles.note}>{sendMessages[failure]}</p>
            {failure === 'signedOut' && (
              <ButtonLink href={loginUrl} native variant="outline" size="sm" onClick={rememberIntent}>
                Entrar com GitHub
              </ButtonLink>
            )}
          </Alert>
        )}

        <RadioGroup label="Tipo" name="kind" orientation="horizontal" options={draftKinds} value={draft.kind} onValueChange={(kind) => change({ kind: kind as Kind })} />

        <Input name="title" label="Título" required fullWidth data-autofocus maxLength={draftLimits.title.max} value={draft.title} onChange={({ target }) => edit('title', target.value)} helperText="Uma frase curta, como “Colunas fixas na tabela”." {...(errorOf('title') ? { error: errorOf('title') } : {})} />

        {similar.length > 0 && (
          <div className={styles.similar}>
            <p className={styles.similarTitle}>Já existe algo parecido? Um voto conta mais do que uma sugestão repetida.</p>
            <ul className={styles.similarList}>
              {similar.map(({ id, title, url, votes }) => (
                <li key={id}>
                  <Link href={url} target="_blank">
                    {title}
                  </Link>{' '}
                  <span className={styles.similarVotes}>
                    {votes} {votes === 1 ? 'voto' : 'votos'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Textarea name="need" label={labels.need} required fullWidth rows={4} maxLength={draftLimits.need.max} value={draft.need} onChange={({ target }) => edit('need', target.value)} {...(errorOf('need') ? { error: errorOf('need') } : {})} />

        <Textarea name="proposal" label={`${labels.proposal} (opcional)`} fullWidth rows={3} maxLength={draftLimits.proposal.max} value={draft.proposal} onChange={({ target }) => edit('proposal', target.value)} {...(errorOf('proposal') ? { error: errorOf('proposal') } : {})} />

        <p className={styles.note}>A sugestão vira uma issue pública no GitHub, com o seu usuário. Cada pessoa pode enviar até {dailySuggestions} por dia.</p>
      </form>
    </Modal>
  )
}

export default SuggestDialog
