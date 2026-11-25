const sequence = 0x30

const octetString = 0x04

const version = [0x02, 0x01, 0x00]

const rsaEncryption = [0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00]

const lengthOf = (size: number) => {
  if (size < 0x80) return [size]

  const bytes: number[] = []

  for (let rest = size; rest > 0; rest >>= 8) bytes.unshift(rest & 0xff)

  return [0x80 | bytes.length, ...bytes]
}

const wrap = (tag: number, content: ArrayLike<number>) => [tag, ...lengthOf(content.length), ...Array.from(content)]

export const toPkcs8 = (pem: string) => {
  const body = pem
    .replace(/-----[A-Z ]+-----/g, '')
    .replace(/\\n/g, '')
    .replace(/\s+/g, '')
  const der = Uint8Array.from(atob(body), (char) => char.charCodeAt(0))

  return pem.includes('BEGIN RSA PRIVATE KEY') ? Uint8Array.from(wrap(sequence, [...version, ...rsaEncryption, ...wrap(octetString, der)])) : der
}
