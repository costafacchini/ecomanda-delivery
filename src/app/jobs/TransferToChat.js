import { transferToChat } from '../services/TransferToChat'
import { jobDependencies } from './dependencies.js'

export default {
  key: 'transfer-to-chat',
  workerEnabled: true,
  async handle(data) {
    return await transferToChat(data.body, jobDependencies)
  },
}
