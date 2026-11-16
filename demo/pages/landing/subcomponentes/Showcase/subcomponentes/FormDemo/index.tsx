import { Button, Checkbox, Input, Select, Slider, useToast } from 'enchase'

import { defaultPlan, plans, seats } from './defaultData.ts'
import styles from './styles.module.css'

import type { FormEvent } from 'react'

const FormDemo = () => {
  const toast = useToast()

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    toast.success('Conta criada. É só um exemplo: nada foi enviado.', 5000)
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.fields}>
        <Input name="name" label="Nome completo" autoComplete="name" required fullWidth />
        <Input name="email" type="email" label="E-mail" autoComplete="email" helperText="Só para avisos da conta." required fullWidth />
        <Input name="password" type="password" label="Senha" autoComplete="new-password" required fullWidth />
        <Select name="plan" label="Plano" options={plans} defaultValue={defaultPlan} fullWidth />
      </div>
      <Slider name="seats" label="Pessoas na equipe" min={seats.min} max={seats.max} defaultValue={seats.initial} showValue />
      <Checkbox name="terms" label="Li e aceito os termos de uso" required />
      <div className={styles.actions}>
        <Button type="reset" variant="ghost">
          Limpar
        </Button>
        <Button type="submit">Criar conta</Button>
      </div>
    </form>
  )
}

export default FormDemo
