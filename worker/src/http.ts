const secure = { 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store' }

export const json = (body: unknown, status = 200, headers: Record<string, string> = {}, cookies: string[] = []) => {
  const all = new Headers({ 'Content-Type': 'application/json; charset=utf-8', ...secure, ...headers })

  cookies.forEach((value) => all.append('Set-Cookie', value))

  return new Response(JSON.stringify(body), { status, headers: all })
}

export const redirect = (location: string, cookies: string[] = []) => {
  const headers = new Headers({ Location: location, 'Referrer-Policy': 'no-referrer', ...secure })

  cookies.forEach((value) => headers.append('Set-Cookie', value))

  return new Response(null, { status: 302, headers })
}

export const cookie = (name: string, value: string, maxAge: number) => `${name}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`

export const cookieOf = (request: Request, name: string) => {
  const pairs = (request.headers.get('Cookie') ?? '').split(';').map((pair) => pair.trim())
  const found = pairs.find((pair) => pair.startsWith(`${name}=`))

  return found ? found.slice(name.length + 1) : null
}

export const sameOrigin = (request: Request) => request.headers.get('Origin') === new URL(request.url).origin

export const unavailable = () => json({ error: 'unavailable' }, 502)

export const signedOut = (cookies: string[] = []) => json({ error: 'signed out' }, 401, {}, cookies)
