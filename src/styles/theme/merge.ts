export type Validate = (name: string, value: unknown) => unknown

export type Validators = Validate | { [key: string]: Validators }

export type TokenKind = 'base' | 'color' | 'density' | 'font' | 'radius' | 'shadow'

export const hasOwn = (target: object, key: string) => Object.prototype.hasOwnProperty.call(target, key)

export const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)

export const mergeTokens = (base: Record<string, unknown>, overrides: unknown, path: string, validators: Validators, kind: TokenKind): Record<string, unknown> => {
  if (!isRecord(overrides)) throw new Error(`Expected an object for "${path}"`)

  const result = { ...base }

  for (const [key, value] of Object.entries(overrides)) {
    const tokenPath = `${path}.${key}`

    if (!hasOwn(base, key)) throw new Error(`Unknown ${kind} token "${tokenPath}"`)
    if (value === undefined) continue

    const validator = typeof validators === 'function' ? validators : validators[key]
    const current = base[key]

    result[key] = isRecord(current) ? mergeTokens(current, value, tokenPath, validator, kind) : (validator as Validate)(tokenPath, value)
  }

  return result
}
