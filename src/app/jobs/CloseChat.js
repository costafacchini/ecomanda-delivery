import { closeChat } from '../services/CloseChat'
import { jobDependencies } from './dependencies.js'

export default {
  key: 'close-chat',
  workerEnabled: true,
  async handle(data) {
    return await closeChat(data.body, jobDependencies)
  },
}
