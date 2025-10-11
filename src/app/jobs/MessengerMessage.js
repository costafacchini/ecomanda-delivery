import transformMessengerBody from '../services/MessengerMessage'

export default {
  key: 'messenger-message',
  async handle(data) {
    return await transformMessengerBody(data.body)
  },
}
