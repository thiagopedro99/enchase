import { Avatar, Button, ButtonLink } from 'enchase'

import { loginUrl } from '../../account.ts'
import styles from './styles.module.css'

import type { AccountProps } from './types.ts'

const Account = ({ account, onLeave }: AccountProps) => {
  if (account.status === 'unavailable') return null

  if (account.status === 'anonymous') {
    return (
      <div className={styles.account}>
        <p className={styles.text}>Entre com o GitHub para votar sem sair do site.</p>
        <ButtonLink href={loginUrl} native variant="outline" size="sm">
          Entrar com GitHub
        </ButtonLink>
      </div>
    )
  }

  return (
    <div className={styles.account}>
      <p className={styles.user}>
        <Avatar size="sm" name={account.user.login} {...(account.user.avatarUrl ? { src: account.user.avatarUrl } : {})} />
        <span className={styles.text}>
          Você entrou como <strong className={styles.login}>@{account.user.login}</strong>
        </span>
      </p>
      <Button variant="ghost" size="sm" onClick={onLeave}>
        Sair
      </Button>
    </div>
  )
}

export default Account
