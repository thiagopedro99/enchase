import type { Locale } from './types.ts'

export const ptBR: Locale = {
  locale: 'pt-BR',
  dir: 'ltr',
  messages: {
    closeModal: 'Fechar modal',
    closeToast: 'Fechar notificação',
    notifications: 'Notificações',
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    mainNavigation: 'Navegação principal',
    mobileNavigation: 'Navegação mobile',
    switchToDark: 'Mudar para tema escuro',
    switchToLight: 'Mudar para tema claro',
    loading: 'Carregando',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    confirmAction: 'Confirmar ação',
    skipToContent: 'Pular para o conteúdo',
    collapseSidebar: 'Recolher menu lateral',
    expandSidebar: 'Expandir menu lateral',
    breadcrumb: 'Trilha de navegação',
    showFullPath: 'Mostrar caminho completo',
    logout: 'Sair',
    showPassword: 'Mostrar senha',
    opensInNewTab: '(abre em nova aba)',
    hidePassword: 'Ocultar senha',
    pagination: 'Paginação',
    previousPage: 'Página anterior',
    nextPage: 'Próxima página',
    increaseValue: 'Aumentar valor',
    decreaseValue: 'Diminuir valor',
    removeTag: 'Remover',
    selectRow: 'Selecionar linha',
    selectAllRows: 'Selecionar todas as linhas',
    noResults: 'Nenhum resultado',
    showOptions: 'Mostrar opções',
    previousMonth: 'Mês anterior',
    nextMonth: 'Próximo mês',
    openCalendar: 'Abrir calendário',
    chooseDate: 'Escolher data',
    board: 'Quadro',
    boardMoveCard: (card: string) => `Mover ${card}`,
    boardMoveCardTo: (card: string) => `Mover ${card} para`,
    boardInstructions: 'Setas movem, espaço solta, Esc cancela.',
    boardMoveUp: 'Subir uma posição',
    boardMoveDown: 'Descer uma posição',
    boardEmptyColumn: 'Solte um cartão aqui',
    boardEmptyColumnReadOnly: 'Nenhum cartão',
    boardCardCount: (count: number) => `${count} ${count === 1 ? 'cartão' : 'cartões'}`,
    boardPickedUp: (card: string, position: number, total: number, column: string) =>
      `${card} pego, posição ${position} de ${total} em ${column}.`,
    boardStep: (card: string, position: number, total: number, column: string) =>
      `${card}: posição ${position} de ${total} em ${column}.`,
    boardDropped: (card: string, position: number, total: number, column: string) =>
      `${card} solto: posição ${position} de ${total} em ${column}.`,
    boardCancelled: (card: string, column: string) => `Movimento cancelado. ${card} voltou para ${column}.`,
    boardMovedByMenu: (card: string, position: number, total: number, column: string) =>
      `${card} movido: posição ${position} de ${total} em ${column}.`
  }
}

export default ptBR
