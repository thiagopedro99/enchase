export const defaultOrientation = 'vertical'

export const plans = [
  { value: 'free', label: 'Grátis' },
  { value: 'pro', label: 'Pro, R$ 29 por mês' },
  { value: 'team', label: 'Equipe, R$ 79 por mês' }
]

export const plansWithLockedTeam = plans.map((plan) => (plan.value === 'team' ? { ...plan, disabled: true } : plan))
