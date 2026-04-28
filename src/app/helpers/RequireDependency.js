function requireDependency(value, name, owner) {
  if (value == null) {
    throw new Error(`${owner} requires ${name}`)
  }

  return value
}

export { requireDependency }
