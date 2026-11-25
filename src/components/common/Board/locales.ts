export type BoardLabels = {
  board: string
  boardMoveCard: (card: string) => string
  boardMoveCardTo: (card: string) => string
  boardInstructions: string
  boardPickedUpInstructions: string
  boardMoveUp: string
  boardMoveDown: string
  boardEmptyColumn: string
  boardEmptyColumnReadOnly: string
  boardCardCount: (count: number) => string
  boardPickedUp: (card: string, position: number, total: number, column: string) => string
  boardStep: (card: string, position: number, total: number, column: string) => string
  boardDropped: (card: string, position: number, total: number, column: string) => string
  boardCancelled: (card: string, column: string) => string
  boardMovedByMenu: (card: string, position: number, total: number, column: string) => string
}

export const boardEn: BoardLabels = {
  board: 'Board',
  boardMoveCard: (card) => `Move ${card}`,
  boardMoveCardTo: (card) => `Move ${card} to`,
  boardInstructions: 'Space picks up the card. With it picked up, arrows move, space drops and Esc cancels.',
  boardPickedUpInstructions: 'Arrows move, space drops, Esc cancels.',
  boardMoveUp: 'Move up one position',
  boardMoveDown: 'Move down one position',
  boardEmptyColumn: 'Drop a card here',
  boardEmptyColumnReadOnly: 'No cards',
  boardCardCount: (count) => `${count} ${count === 1 ? 'card' : 'cards'}`,
  boardPickedUp: (card, position, total, column) => `${card} picked up, position ${position} of ${total} in ${column}.`,
  boardStep: (card, position, total, column) => `${card}: position ${position} of ${total} in ${column}.`,
  boardDropped: (card, position, total, column) => `${card} dropped: position ${position} of ${total} in ${column}.`,
  boardCancelled: (card, column) => `Move cancelled. ${card} returned to ${column}.`,
  boardMovedByMenu: (card, position, total, column) => `${card} moved: position ${position} of ${total} in ${column}.`
}

export const boardPtBR: BoardLabels = {
  board: 'Quadro',
  boardMoveCard: (card) => `Mover ${card}`,
  boardMoveCardTo: (card) => `Mover ${card} para`,
  boardInstructions: 'Espaço pega o cartão. Com ele pego, as setas movem, espaço solta e Esc cancela.',
  boardPickedUpInstructions: 'Setas movem, espaço solta, Esc cancela.',
  boardMoveUp: 'Subir uma posição',
  boardMoveDown: 'Descer uma posição',
  boardEmptyColumn: 'Solte um cartão aqui',
  boardEmptyColumnReadOnly: 'Nenhum cartão',
  boardCardCount: (count) => `${count} ${count === 1 ? 'cartão' : 'cartões'}`,
  boardPickedUp: (card, position, total, column) => `${card} pego, posição ${position} de ${total} em ${column}.`,
  boardStep: (card, position, total, column) => `${card}: posição ${position} de ${total} em ${column}.`,
  boardDropped: (card, position, total, column) => `${card} solto: posição ${position} de ${total} em ${column}.`,
  boardCancelled: (card, column) => `Movimento cancelado. ${card} voltou para ${column}.`,
  boardMovedByMenu: (card, position, total, column) => `${card} movido: posição ${position} de ${total} em ${column}.`
}

export const boardLabelsFor = (locale: string, overrides: Partial<BoardLabels> | undefined): BoardLabels => ({
  ...(locale === 'pt-BR' ? boardPtBR : boardEn),
  ...overrides
})
