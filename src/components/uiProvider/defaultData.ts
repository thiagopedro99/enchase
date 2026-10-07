import { defaultMotionSettings } from '../../motion/defaultData.ts'

import type { UIConfig, UILabels } from './types.ts'

export const defaultLabels: UILabels = {
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
  hidePassword: 'Ocultar senha'
}

export const defaultUIConfig: UIConfig = {
  motion: defaultMotionSettings,
  labels: defaultLabels
}
