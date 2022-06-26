const { Factory } = require('fishery')
const { licensee } = require('./licensee')

const template = Factory.define(() => ({
  name: 'template',
  namespace: 'Namespace',
  licensee: licensee.build(),
}))

module.exports = { template }
