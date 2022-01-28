const Go2go = require('./Go2go')

function createCartPlugin(licensee) {
  switch (licensee.cartDefault) {
    case 'go2go':
      return new Go2go()
    default:
      throw `Plugin de cart não configurado: ${licensee.cartDefault}`
  }
}

module.exports = createCartPlugin
