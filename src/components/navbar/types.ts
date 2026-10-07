export interface MenuItem {
  label: string
  path: string
}

export interface NavbarProps {
  logo?: string
  menuItems?: MenuItem[]
}

export interface MobileDrawerProps {
  id: string
  menuItems: MenuItem[]
  onClose: () => void
}
