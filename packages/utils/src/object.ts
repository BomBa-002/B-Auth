/** Shallow-omit the given keys from an object, returning a new object. */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj }
  for (const key of keys) {
    delete result[key]
  }
  return result
}

/** Shallow-pick the given keys from an object, returning a new object. */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    if (key in obj) result[key] = obj[key]
  }
  return result
}

export function isEmptyObject(obj: Record<string, unknown> | null | undefined): boolean {
  return !obj || Object.keys(obj).length === 0
}
