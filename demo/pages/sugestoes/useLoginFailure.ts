import { useEffect, useState } from 'react'

const parameter = 'login'

const failed = () => new URLSearchParams(window.location.search).get(parameter) === 'failed'

export const useLoginFailure = () => {
  const [shown] = useState(failed)

  useEffect(() => {
    const url = new URL(window.location.href)

    if (!url.searchParams.has(parameter)) return

    url.searchParams.delete(parameter)
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  }, [])

  return shown
}
