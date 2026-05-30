export default function parseUrl(url: any, urlParams: any) {
  return urlParams && objectToQueryParameter(urlParams) !== '' ? `${url}?${objectToQueryParameter(urlParams)}` : url
}

function objectToQueryParameter(object: any) {
  return Object.keys(object)
    .map((key) => {
      if (object[key] == null) return ''
      if (object[key] instanceof Array) return encodeArrayToUrl(object, key)
      return `${key}=${encodeValueToUrl(object[key])}`
    })
    .filter((param) => param.length > 0)
    .join('&')
}

function encodeValueToUrl(value: any): any {
  if (isDate(value)) {
    return new Date(value).toISOString()
  } else if (value instanceof Array) {
    return value.map(encodeValueToUrl)
  } else {
    return `${encodeURIComponent(value)}`
  }
}

function isDate(value: any) {
  if (value instanceof Date) {
    return true
  }

  if (typeof value === 'string' && /\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.+Z$/.test(value)) {
    return true
  }

  return false
}

function encodeArrayToUrl(objectWithArray: any, key: any) {
  const array = objectWithArray[key]
  const isArrayOfObjects = array.find((value: any) => typeof value === 'object' && !(value instanceof Date))

  if (isArrayOfObjects) {
    const queryParameters: any[] = []
    array.forEach((value: any) => {
      Object.keys(value).forEach((prop) => {
        queryParameters.push(`${key}[][${prop}]=${encodeValueToUrl(value[prop])}`)
      })
    })
    return queryParameters.join('&')
  } else {
    return `${key}=${encodeValueToUrl(array)}`
  }
}
