const transformMessengerBody = require('../services/messenger-message')

module.exports = {
  key: 'messenger-message',
  async handle(data) {
    await transformMessengerBody(data.body, data.licensee)
  },
}
