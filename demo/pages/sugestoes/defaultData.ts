import type { Filters, Kind, KindFilter, Sort, Status, StatusInfo, VoteResult } from './types.ts'

export const statuses: StatusInfo[] = [
  { value: 'analise', label: 'Em análise', text: 'Chegou e ainda vamos avaliar.' },
  { value: 'backlog', label: 'Backlog', text: 'Aprovada, esperando a vez.' },
  { value: 'desenvolvimento', label: 'Em desenvolvimento', text: 'Sendo feita agora.' },
  { value: 'lancado', label: 'Lançado', text: 'Já está numa versão publicada.' },
  { value: 'recusado', label: 'Não vamos fazer', text: 'Avaliada e recusada, com o motivo.' }
]

export const kindLabels: Record<Kind, string> = {
  componente: 'Componente novo',
  melhoria: 'Melhoria',
  correcao: 'Correção'
}

export const kindOptions: { value: KindFilter; label: string }[] = [
  { value: 'todos', label: 'Todos os tipos' },
  { value: 'componente', label: kindLabels.componente },
  { value: 'melhoria', label: kindLabels.melhoria },
  { value: 'correcao', label: kindLabels.correcao }
]

export const sortOptions: { value: Sort; label: string }[] = [
  { value: 'votos', label: 'Mais votadas' },
  { value: 'recentes', label: 'Mais recentes' }
]

export const defaultFilters: Filters = {
  query: '',
  kind: 'todos',
  sort: 'votos'
}

export const steps = [
  { title: 'Abra a sugestão no GitHub', text: 'Um formulário curto: o problema, a ideia e um exemplo de uso.' },
  { title: 'Vote com 👍', text: 'As mais votadas sobem dentro de cada coluna.' },
  { title: 'Acompanhe o card', text: 'Ele anda de Em análise até Lançado, ou recebe o motivo da recusa.' }
]

export const votable: Status[] = ['analise', 'backlog', 'desenvolvimento']

export const voteMessages: Record<Exclude<VoteResult, 'ok'> | 'logout', string> = {
  signedOut: 'Sua sessão terminou. Entre de novo para votar.',
  limited: 'Muitos votos em pouco tempo. Espere um minuto e tente de novo.',
  failed: 'Não foi possível registrar o voto. Tente de novo.',
  logout: 'Não foi possível sair. Tente de novo.'
}
