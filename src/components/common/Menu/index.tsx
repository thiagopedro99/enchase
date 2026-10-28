import { cloneElement, isValidElement, useRef } from 'react'

import { defaultOffset, defaultOpen, defaultPlacement } from './defaultData.ts'
import { useControllableState } from '@hooks/useControllableState.ts'
import { classNames } from '@utils/classNames.ts'
import { Popover } from '../Popover/index.tsx'
import { MenuList } from './MenuList.tsx'
import styles from './styles.module.css'

import type { KeyboardEvent, MouseEvent } from 'react'
import type { MenuEntryPoint, MenuProps } from './types.ts'

type TriggerProps = {
  onClick?: ((event: MouseEvent<HTMLElement>) => void) | undefined
  onKeyDown?: ((event: KeyboardEvent<HTMLElement>) => void) | undefined
}

export const Menu = ({ children, items, label, open, defaultOpen: initiallyOpen = defaultOpen, onOpenChange, placement = defaultPlacement, offset = defaultOffset, container, animation, className, style, contentClassName, contentStyle }: MenuProps) => {
  const [isOpen, setOpen] = useControllableState(open, initiallyOpen, onOpenChange)
  const entry = useRef<MenuEntryPoint | undefined>(undefined)

  const trigger = isValidElement<TriggerProps>(children)
    ? cloneElement(children, {
        onClick: (event) => {
          children.props.onClick?.(event)
          if (!isOpen) entry.current = 'first'
        },
        onKeyDown: (event) => {
          children.props.onKeyDown?.(event)

          if (event.defaultPrevented || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return

          event.preventDefault()

          if (isOpen) return

          entry.current = event.key === 'ArrowDown' ? 'first' : 'last'
          setOpen(true)
        }
      })
    : children

  return (
    <Popover
      role="menu"
      label={label}
      open={isOpen}
      onOpenChange={setOpen}
      placement={placement}
      offset={offset}
      container={container}
      animation={animation}
      className={className}
      style={style}
      contentClassName={classNames(styles.menu, contentClassName)}
      contentStyle={contentStyle}
      content={<MenuList items={items} entry={entry} animation={animation} />}
    >
      {trigger}
    </Popover>
  )
}

export default Menu
