import { Avatar, Button, Link } from 'enchase'

import { GithubIcon } from '../../../../components/icons.tsx'
import { loginUrl } from '../../account.ts'
import styles from './styles.module.css'

import type { AccountProps } from './types.ts'

const Account = ({ account, onLeave }: AccountProps) => {
  if (account.status === 'unavailable') return null

  if (account.status === 'anonymous') {
    return (
      <p className={styles.account}>
        <GithubIcon size={16} />
        <span>
          <Link href={loginUrl} native className={styles.link}>
            Entrar com GitHub
          </Link>{' '}
          para sugerir e votar sem sair do site.
        </span>
      </p>
    )
  }

  return (
    <p className={styles.account}>
      <Avatar size="sm" name={account.user.login} className={styles.avatar} {...(account.user.avatarUrl ? { src: account.user.avatarUrl } : {})} />
      <span>
        Você entrou como <strong className={styles.login}>@{account.user.login}</strong>
      </span>
      <span className={styles.separator} aria-hidden="true" />
      <Button variant="link" size="sm" className={styles.action} onClick={onLeave}>
        Sair
      </Button>
    </p>
  )
}

export default Account
