import { sendMessageToMessenger } from '../services/SendMessageToMessenger'
import { jobDependencies } from './dependencies'

export default {
  key: 'send-message-to-messenger',
  workerEnabled: true,
  async handle(data) {
    return await sendMessageToMessenger(data.body, jobDependencies)
  },
}
