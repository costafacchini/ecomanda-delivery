export default function parseUrl(url: string, urlParams: Record<string, unknown>): string {
  return urlParams && objectToQueryParameter(urlParams) !== '' ? `${url}?${objectToQueryParameter(urlParams)}` : url
}

function objectToQueryParameter(object: Record<string, unknown>): string {
  return Object.keys(object)
    .map((key) => {
      if (object[key] == null) return ''
      if (object[key] instanceof Array) return encodeArrayToUrl(object, key)
      return `${key}=${encodeValueToUrl(object[key])}`
    })
    .filter((param) => param.length > 0)
    .join('&')
}

function encodeValueToUrl(value: unknown): string {
  if (isDate(value)) {
    return new Date(value as string | Date).toISOString()
  } else if (value instanceof Array) {
    return value.map(encodeValueToUrl).join(',')
  } else {
    return `${encodeURIComponent(String(value))}`
  }
}

function isDate(value: unknown): boolean {
  if (value instanceof Date) {
    return true
  }

  if (typeof value === 'string' && /\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.+Z$/.test(value)) {
    return true
  }

  return false
}

function encodeArrayToUrl(objectWithArray: Record<string, unknown>, key: string): string {
  const array = objectWithArray[key] as unknown[]
  const isArrayOfObjects = (array as unknown[]).find((value: unknown) => typeof value === 'object' && !(value instanceof Date))

  if (isArrayOfObjects) {
    const queryParameters: string[] = []
    ;(array as Record<string, unknown>[]).forEach((value) => {
      Object.keys(value).forEach((prop) => {
        queryParameters.push(`${key}[][${prop}]=${encodeValueToUrl(value[prop])}`)
      })
    })
    return queryParameters.join('&')
  } else {
    return `${key}=${encodeValueToUrl(array)}`
  }
}
