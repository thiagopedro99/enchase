import { dailySuggestions, draftLimits } from './draft.ts'

import { commentLimits, dailyComments } from './comment.ts'

import type { CommentFailure, Filters, Kind, KindFilter, LoginReason, MoveFailure, SendFailure, Sort, Status, StatusInfo, VoteResult } from './types.ts'
import type { DraftField, DraftProblem } from './draft.ts'

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
  { title: 'Envie a sugestão', text: 'Um formulário curto: o que você precisa e como imagina.' },
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

export const draftKinds: { value: Kind; label: string }[] = [
  { value: 'componente', label: kindLabels.componente },
  { value: 'melhoria', label: kindLabels.melhoria },
  { value: 'correcao', label: kindLabels.correcao }
]

export const draftLabels: Record<Kind, { need: string; proposal: string }> = {
  componente: { need: 'O que você precisa, e o que faz hoje no lugar', proposal: 'Como você imagina' },
  melhoria: { need: 'O que você precisa, e o que faz hoje no lugar', proposal: 'Como você imagina' },
  correcao: { need: 'O que aconteceu, e o que você esperava', proposal: 'Como reproduzir' }
}

export const draftMessage = (field: DraftField, problem: DraftProblem) => {
  if (problem === 'missing') return 'Preencha este campo.'
  if (problem === 'invalid' || field === 'kind') return 'Escolha um dos tipos.'

  return problem === 'short' ? `Escreva pelo menos ${draftLimits[field].min} caracteres.` : `Use no máximo ${draftLimits[field].max} caracteres.`
}

export const sendMessages: Record<SendFailure, string> = {
  signedOut: 'Sua sessão terminou. Entre de novo para enviar: o que você escreveu fica guardado.',
  daily: `Você já enviou ${dailySuggestions} sugestões nas últimas 24 horas. Tente de novo mais tarde.`,
  limited: 'Muitos envios em pouco tempo. Espere um minuto e tente de novo.',
  failed: 'Não foi possível enviar a sugestão. Tente de novo.'
}

export const loginTexts: Record<LoginReason, { title: string; text: string }> = {
  vote: { title: 'Entre para votar', text: 'O voto é um 👍 seu na issue do GitHub. Entre com a sua conta para votar daqui mesmo.' },
  suggest: { title: 'Entre para sugerir', text: 'A sugestão vira uma issue pública no GitHub, com o seu usuário. Entre com a sua conta para enviar daqui mesmo.' }
}

export const intentKey = 'enchase-suggest-intent'

export const draftKey = 'enchase-suggest-draft'

export const moveMessages: Record<MoveFailure, string> = {
  signedOut: 'Sua sessão terminou. Entre de novo para mover os cartões.',
  forbidden: 'Você não tem permissão para mover os cartões.',
  limited: 'Muitos movimentos em pouco tempo. Espere um minuto e tente de novo.',
  failed: 'Não foi possível mover o cartão. Ele voltou para a coluna de origem.'
}

export const commentMessages: Record<CommentFailure, string> = {
  invalid: `Escreva de ${commentLimits.min} a ${commentLimits.max} caracteres.`,
  signedOut: 'Sua sessão terminou. Entre de novo para comentar: o que você escreveu continua aqui.',
  limited: 'Muitos comentários em pouco tempo. Espere um minuto e tente de novo.',
  daily: `Você já enviou ${dailyComments} comentários nas últimas 24 horas. Tente de novo mais tarde.`,
  locked: 'Os comentários desta sugestão foram fechados no GitHub.',
  failed: 'Não foi possível enviar o comentário. Tente de novo.'
}

export const issueParameter = 'issue'
