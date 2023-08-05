const Go2go = require('./Go2go')
const Go2goV2 = require('./Go2goV2')
const Alloy = require('./Alloy')

function createCartPlugin(licensee) {
  switch (licensee.cartDefault) {
    case 'go2go':
      return new Go2go()
    case 'go2go_v2':
      return new Go2goV2()
    case 'alloy':
      return new Alloy()
    default:
      throw `Plugin de cart não configurado: ${licensee.cartDefault}`
  }
}

module.exports = createCartPlugin
