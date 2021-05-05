const transformMessengerBody = require('../services/MessengerMessage')

module.exports = {
  key: 'messenger-message',
  async handle(data) {
    await transformMessengerBody(data.body, data.licensee)
  },
}
