const { Factory } = require('fishery')
const { licensee } = require('./licensee')

const product = Factory.define(() => ({
  name: 'Product 1',
  licensee: licensee.build(),
}))

module.exports = { product }
