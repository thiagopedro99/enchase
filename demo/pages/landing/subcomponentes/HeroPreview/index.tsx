import { Avatar, Badge, Button, Card, Input, Progress, SegmentedControl, Select, Switch, Tag, useToast } from 'enchase'

import { defaultPeriod, defaultProjectName, defaultVisibility, periods, rollout, team, topics, visibilityOptions } from './defaultData.ts'
import styles from './styles.module.css'

import type { FormEvent } from 'react'

const HeroPreview = () => {
  const toast = useToast()

  const create = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = new FormData(event.currentTarget).get('project')

    toast.success(`Projeto ${name || 'sem nome'} criado`, 4000)
  }

  return (
    <div className={styles.preview} role="group" aria-label="Exemplo de tela montada com os componentes da biblioteca">
      <Card variant="elevated" header="Novo projeto" headerExtra={<Badge variant="info">Rascunho</Badge>} className={styles.form}>
        <form className={styles.fields} onSubmit={create}>
          <Input name="project" label="Nome do projeto" defaultValue={defaultProjectName} fullWidth />
          <Select name="visibility" label="Quem pode ver" options={visibilityOptions} defaultValue={defaultVisibility} fullWidth />
          <Switch name="notify" label="Avisar a equipe" defaultChecked />
          <div className={styles.formActions}>
            <Button type="reset" variant="ghost">
              Limpar
            </Button>
            <Button type="submit">Criar</Button>
          </div>
        </form>
      </Card>

      <Card variant="elevated" className={styles.status}>
        <div className={styles.row}>
          <p className={styles.cardTitle}>Publicação</p>
          <Badge variant="success">No ar</Badge>
        </div>
        <Progress value={rollout} showValue aria-label="Progresso da publicação" />
        <p className={styles.note}>Versão 2.4 liberada para {rollout}% das contas.</p>
      </Card>

      <Card variant="elevated" className={styles.team}>
        <div className={styles.row}>
          <p className={styles.cardTitle}>Equipe</p>
          <ul className={styles.avatars}>
            {team.map((name) => (
              <li key={name} className={styles.avatar}>
                <Avatar name={name} size="sm" />
              </li>
            ))}
          </ul>
        </div>
        <SegmentedControl items={periods} defaultValue={defaultPeriod} ariaLabel="Período do relatório" size="sm" className={styles.periods} />
        <ul className={styles.topics}>
          {topics.map((topic) => (
            <li key={topic}>
              <Tag size="sm">{topic}</Tag>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

export default HeroPreview
