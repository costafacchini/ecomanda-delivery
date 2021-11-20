export default function parseUrl(url, urlParams) {
  return urlParams && objectToQueryParameter(urlParams) !== '' ? `${url}?${objectToQueryParameter(urlParams)}` : url
}

function objectToQueryParameter(object) {
  return Object.keys(object)
    .map((key) => {
      if (object[key] == null) return ''
      if (object[key] instanceof Array) return encodeArrayToUrl(object, key)
      return `${key}=${encodeValueToUrl(object[key])}`
    })
    .filter((param) => param.length > 0)
    .join('&')
}

function encodeValueToUrl(value) {
  if (isDate(value)) {
    return new Date(value).toISOString()
  } else if (value instanceof Array) {
    return value.map(encodeValueToUrl)
  } else {
    return `${encodeURIComponent(value)}`
  }
}

function isDate(value) {
  if (value instanceof Date) {
    return true
  }

  if (typeof value === 'string' && /\d\d-\d\d-\d\dT\d\d:\d\d:\d\d.+Z$/.test(value)) {
    return true
  }

  return false
}

function encodeArrayToUrl(objectWithArray, key) {
  const array = objectWithArray[key]
  const isArrayOfObjects = array.find((value) => typeof value === 'object' && !(value instanceof Date))

  if (isArrayOfObjects) {
    const queryParameters = []
    array.forEach((value) => {
      Object.keys(value).forEach((prop) => {
        queryParameters.push(`${key}[][${prop}]=${encodeValueToUrl(value[prop])}`)
      })
    })
    return queryParameters.join('&')
  } else {
    return `${key}=${encodeValueToUrl(array)}`
  }
}
