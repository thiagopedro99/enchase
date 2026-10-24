export const focusableSelector = [
  'a[href]',
  'button:not(:disabled)',
  'input:not(:disabled):not([type="hidden"])',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  'iframe',
  'audio[controls]',
  'video[controls]',
  'details > summary:first-of-type',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]'
]
  .map((selector) => `${selector}:not([tabindex^="-"])`)
  .join(', ')

const isRadio = (element: HTMLElement): element is HTMLInputElement => element instanceof HTMLInputElement && element.type === 'radio'

const byDocumentOrder = (first: HTMLElement, second: HTMLElement) => (first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)

const displayed = (node: HTMLElement | null): boolean => node === null || (getComputedStyle(node).display !== 'none' && displayed(node.parentElement))

const isRendered = (element: HTMLElement) => {
  if (typeof element.checkVisibility === 'function') return element.checkVisibility({ checkVisibilityCSS: true })

  return getComputedStyle(element).visibility !== 'hidden' && displayed(element)
}

export const tabbablesIn = (root: ParentNode) => {
  const candidates = Array.from(root.querySelectorAll<HTMLElement>(focusableSelector))
    .filter((element) => !element.closest('[hidden], [inert]') && isRendered(element))
    .sort(byDocumentOrder)

  return candidates.filter((element) => {
    if (!isRadio(element) || !element.name || element.checked) return true

    return !candidates.some((other) => isRadio(other) && other.name === element.name && other.checked)
  })
}

export const focusInOrder = (candidates: HTMLElement[], start: number, step: number) =>
  candidates
    .map((_, offset) => candidates[(start + offset * step + candidates.length) % candidates.length])
    .some((candidate) => {
      candidate.focus({ preventScroll: true })

      return document.activeElement === candidate
    })
