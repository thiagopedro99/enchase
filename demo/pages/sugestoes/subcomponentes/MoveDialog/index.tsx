import { Button, Input, Modal, Textarea } from 'enchase'
import { useId, useState } from 'react'

import { checkMove, reasonLimits } from '../../move.ts'
import styles from './styles.module.css'

import type { MoveProblem, MoveProblems } from '../../move.ts'
import type { MoveDialogProps } from './types.ts'
import type { FormEvent } from 'react'

const messages: Record<MoveProblem, string> = {
  missing: 'Preencha este campo.',
  invalid: 'Use o número da versão, como 0.27.0.',
  short: `Escreva pelo menos ${reasonLimits.min} caracteres.`,
  long: `Use no máximo ${reasonLimits.max} caracteres.`
}

const MoveDialog = ({ request, onConfirm, onClose }: MoveDialogProps) => {
  const [version, setVersion] = useState('')
  const [reason, setReason] = useState('')
  const [problems, setProblems] = useState<MoveProblems>({})
  const formId = useId()
  const releasing = request?.status === 'lancado'

  const close = () => {
    setProblems({})
    onClose()
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()

    const checked = checkMove({ status: request?.status, version, reason })

    if (!checked.ok) return setProblems(checked.problems)

    setVersion('')
    setReason('')
    setProblems({})
    onConfirm({ version: checked.move.version, reason: checked.move.reason })
  }

  return (
    <Modal
      open={request !== null}
      onClose={close}
      title={releasing ? 'Em qual versão saiu?' : 'Por que não vamos fazer?'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            Cancelar
          </Button>
          <Button type="submit" form={formId}>
            {releasing ? 'Mover para Lançado' : 'Mover para Não vamos fazer'}
          </Button>
        </>
      }
    >
      <form id={formId} className={styles.form} noValidate onSubmit={submit}>
        <p className={styles.text}>{request?.suggestion.title}</p>
        {releasing ? (
          <Input name="version" label="Versão" required fullWidth data-autofocus inputMode="decimal" placeholder="0.27.0" value={version} onChange={({ target }) => setVersion(target.value)} helperText="A issue é fechada com o milestone dessa versão." {...(problems.version ? { error: messages[problems.version] } : {})} />
        ) : (
          <Textarea name="reason" label="Motivo" required fullWidth data-autofocus rows={4} maxLength={reasonLimits.max} value={reason} onChange={({ target }) => setReason(target.value)} helperText="Vira um comentário seu na issue e aparece no cartão." {...(problems.reason ? { error: messages[problems.reason] } : {})} />
        )}
      </form>
    </Modal>
  )
}

export default MoveDialog
