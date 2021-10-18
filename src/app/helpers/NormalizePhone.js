const normalize = (number) => {
  let result = number
  if (number[number.length - 1] === '.') {
    result = number.slice(0, number.length - 1)
  }
  if (result.length <= 9) {
    result = ''
  }
  if (result.length === 10 || result.length === 11) {
    result = '55' + result
  }
  if (result.length === 12) {
    result = [result.slice(0, 4), '9', result.slice(4)].join('')
  }

  return result
}

class NormalizePhone {
  constructor(number) {
    this.type = number.includes('@g.us') || number.replace(/[^0-9]/g, '').length > 13 ? '@g.us' : '@c.us'
    this.number = normalize(number.replace(/[^0-9.-]/g, ''))
  }
}

module.exports = NormalizePhone
