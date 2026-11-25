import { Button, ButtonLink, Link, Modal } from 'enchase'

import { loginUrl } from '../../account.ts'
import styles from './styles.module.css'

import type { LoginDialogProps } from './types.ts'

const LoginDialog = ({ suggestion, onClose }: LoginDialogProps) => (
  <Modal
    isOpen={suggestion !== null}
    onClose={onClose}
    title="Entre para votar"
    size="sm"
    footer={
      <>
        <Button variant="ghost" onClick={onClose}>
          Agora não
        </Button>
        <ButtonLink href={loginUrl} native>
          Entrar com GitHub
        </ButtonLink>
      </>
    }
  >
    <div className={styles.body}>
      <p className={styles.text}>O voto é um 👍 seu na issue do GitHub. Entre com a sua conta para votar daqui mesmo.</p>
      <p className={styles.text}>O site guarda a sua sessão por até 8 horas e só age em seu nome no repositório da Enchase, quando você vota.</p>
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

export default LoginDialog
