function requireDependency<T>(value: T | null | undefined, name: string, owner: string): T {
  if (value == null) {
    throw new Error(`${owner} requires ${name}`)
  }

  return value
}

export { requireDependency }
