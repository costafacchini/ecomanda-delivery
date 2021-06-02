class NormalizePhone {
  constructor(number) {
    this.number = number.replace(/[^0-9.-]/g, '')
    this.type = number.includes('@g.us') ? '@g.us' : '@c.us'
    this.#normalize()
  }

  #normalize() {
    if (this.number[this.number.length - 1] === '.') {
      this.number = this.number.slice(0, this.number.length - 1)
    }
    if (this.number.length <= 9) {
      this.number = ''
    }
    if (this.number.length === 10 || this.number.length === 11) {
      this.number = '55' + this.number
    }
    if (this.number.length === 12) {
      this.number = [this.number.slice(0, 4), '9', this.number.slice(4)].join('')
    }
  }
}

module.exports = NormalizePhone