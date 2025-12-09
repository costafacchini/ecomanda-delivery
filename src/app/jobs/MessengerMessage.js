import { transformMessengerBody } from '../services/MessengerMessage.js'

export default {
  key: 'messenger-message',
  workerEnabled: true,
  async handle(data) {
    return await transformMessengerBody(data.body)
  },
}
