const { Factory } = require('fishery')
const { contact } = require('./contact')

const room = Factory.define(() => ({
  roomId: 'ka3DiV9CuHD765',
  token: 'token',
  contact: contact.build(),
  closed: false,
}))

module.exports = { room }
