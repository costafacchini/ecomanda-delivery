const { Factory } = require('fishery')
const { licensee } = require('./licensee')

const backgroundjob = Factory.define(() => ({
  status: 'scheduled',
  kind: 'get-pix',
  body: {
    cart_id: 'cart-id',
  },
  licensee: licensee.build(),
}))

module.exports = { backgroundjob }
