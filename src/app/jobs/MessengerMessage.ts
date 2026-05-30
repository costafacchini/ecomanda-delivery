import { transformMessengerBody } from '../services/MessengerMessage'
import { jobDependencies } from './dependencies'

export default {
  key: 'messenger-message',
  workerEnabled: true,
  async handle(data) {
    return await transformMessengerBody(data.body, jobDependencies)
  },
}
