import { useNavigator } from '@hooks/useNavigator.ts'
import { shouldNavigate } from '@utils/href.ts'

import type { LinkProps } from './types.ts'
import type { MouseEvent } from 'react'

export const Link = ({ href, onClick, target, download, ...props }: LinkProps) => {
  const navigate = useNavigator()

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)

    if (!navigate || !shouldNavigate(href, event, { target, download })) return

    event.preventDefault()
    navigate(href)
  }

  return <a {...props} href={href} target={target} download={download} onClick={handleClick} />
}

export default Link
