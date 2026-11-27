import { Button, ButtonLink, Link, Modal } from 'enchase'

import { rememberIntent } from '../../intent.ts'
import { loginTexts } from '../../defaultData.ts'
import { loginUrl } from '../../account.ts'
import styles from './styles.module.css'

import type { LoginDialogProps } from './types.ts'

const LoginDialog = ({ request, onClose }: LoginDialogProps) => {
  const reason = request?.reason ?? 'vote'
  const suggestion = request?.suggestion

  return (
    <Modal
      open={request !== null}
      onClose={onClose}
      title={loginTexts[reason].title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Agora não
          </Button>
          <ButtonLink href={loginUrl} native {...(reason === 'suggest' ? { onClick: rememberIntent } : {})}>
            Entrar com GitHub
          </ButtonLink>
        </>
      }
    >
      <div className={styles.body}>
        <p className={styles.text}>{loginTexts[reason].text}</p>
        <p className={styles.text}>O site guarda a sua sessão por até 8 horas e só age em seu nome no repositório da Enchase, quando você vota ou sugere.</p>
        {suggestion && (
          <p className={styles.text}>
            Prefere votar direto no GitHub?{' '}
            <Link href={suggestion.url} target="_blank">
              Abrir a issue #{suggestion.id}
            </Link>
          </p>
        )}
      </div>
    </Modal>
  )
}

export default LoginDialog
