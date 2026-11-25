const encoder = new TextEncoder()

export const bytesOf = (text: string) => encoder.encode(text)

export const base64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

export const fromBase64url = (text: string) => Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), (char) => char.charCodeAt(0))

export const random = (size: number) => base64url(crypto.getRandomValues(new Uint8Array(size)))

export const sha256 = async (text: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', bytesOf(text)))

export const hex = (bytes: Uint8Array) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
