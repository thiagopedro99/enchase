export const defaultVariant = 'info'

export const variants = ['info', 'success', 'warning', 'error'] as const

export const variantTexts = {
  info: { title: 'Nova versão disponível', message: 'Atualize para ver as novidades.' },
  success: { title: 'Alterações salvas', message: 'Tudo certo com o seu cadastro.' },
  warning: { title: 'Atenção ao prazo', message: 'A sua assinatura vence hoje.' },
  error: { title: 'Não foi possível enviar', message: 'Confira a conexão e tente de novo.' }
} as const
