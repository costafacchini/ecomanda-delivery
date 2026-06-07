const normalize = (number: string): string => {
  let result = number

  if (result.length <= 9) {
    return ''
  }

  if (result.length === 10 || result.length === 11) {
    result = '55' + result
  }

  if (result.length === 12) {
    const firstDigitAfterDDD = parseInt(result[4])
    if (firstDigitAfterDDD > 5) {
      result = [result.slice(0, 4), '9', result.slice(4)].join('')
    }
  }

  return result
}

class NormalizePhone {
  type: string
  number: string

  constructor(number: string) {
    this.type = number.includes('@g.us') || number.replace(/[^0-9]/g, '').length > 13 ? '@g.us' : '@c.us'
    this.number = normalize(number.replace(/@.*$/, '').replace(/[^0-9.-]/g, ''))
  }
}

export { NormalizePhone }
