const transformMessengerBody = require('../services/MessengerMessage')

module.exports = {
  key: 'messenger-message',
  async handle(data) {
    return await transformMessengerBody(data.body)
  },
}
