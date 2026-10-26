export const defaultOrientation = 'vertical'

export const plans = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro, $29 per month' },
  { value: 'team', label: 'Team, $79 per month' }
]

export const plansWithLockedTeam = plans.map((plan) => (plan.value === 'team' ? { ...plan, disabled: true } : plan))
