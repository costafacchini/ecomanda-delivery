const { Factory } = require('fishery')
const { licensee } = require('./licensee')

const body = Factory.define(() => ({
  content: {
    message: 'text',
  },
  licensee: licensee.build(),
}))

module.exports = { body }
