import { Avatar, Button, ButtonLink } from 'enchase'

import { GithubIcon } from '../../../../components/icons.tsx'
import { loginUrl } from '../../account.ts'
import styles from './styles.module.css'

import type { AccountProps } from './types.ts'

const Account = ({ account, onLeave }: AccountProps) => {
  if (account.status === 'unavailable') return null

  if (account.status === 'anonymous') {
    return (
      <ButtonLink href={loginUrl} native variant="outline" size="sm" className={styles.login} aria-label="Entrar com GitHub">
        <GithubIcon size={16} />
        Entrar
      </ButtonLink>
    )
  }

  return (
    <div className={styles.account}>
      <Avatar size="sm" name={account.user.login} className={styles.avatar} {...(account.user.avatarUrl ? { src: account.user.avatarUrl } : {})} />
      <span className={styles.name}>@{account.user.login}</span>
      <Button variant="ghost" size="sm" onClick={onLeave}>
        Sair
      </Button>
    </div>
  )
}

export default Account
