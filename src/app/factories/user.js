const { Factory } = require('fishery')
const { licensee } = require('./licensee')

const userSuper = Factory.define(() => ({
  name: 'John Doe',
  email: 'john@doe.com',
  password: '12345678',
  active: true,
  isSuper: true,
}))

const user = Factory.define(() => ({
  name: 'Raymond Reddington',
  email: 'raymond@reddington.com',
  password: '12345678',
  active: true,
  isSuper: false,
  licensee: licensee.build(),
}))

module.exports = { user, userSuper }
