import { sendMessageToMessenger } from '../services/SendMessageToMessenger.js'
import { jobDependencies } from './dependencies.js'

export default {
  key: 'send-message-to-messenger',
  workerEnabled: true,
  async handle(data) {
    return await sendMessageToMessenger(data.body, jobDependencies)
  },
}
