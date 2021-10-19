const resetChatbots = require('../services/ResetChatbots')

module.exports = {
  key: 'reset-chatbots',
  async handle(data) {
    return await resetChatbots(data.body)
  },
}
