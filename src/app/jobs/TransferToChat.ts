import { transferToChat } from '../services/TransferToChat'
import { jobDependencies } from './dependencies'

export default {
  key: 'transfer-to-chat',
  workerEnabled: true,
  async handle(data: any) {
    return await transferToChat(data.body, jobDependencies)
  },
}
