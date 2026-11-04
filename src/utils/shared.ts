export const shared = <T>(name: string, create: () => T): T => {
  const key = Symbol.for(`enchase.${name}`)
  const store = globalThis as unknown as Record<symbol, T | undefined>

  return (store[key] ??= create())
}
