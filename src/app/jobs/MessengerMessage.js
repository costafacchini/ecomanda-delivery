import { transformMessengerBody } from '../services/MessengerMessage'
import { jobDependencies } from './dependencies.js'

export default {
  key: 'messenger-message',
  workerEnabled: true,
  async handle(data) {
    return await transformMessengerBody(data.body, jobDependencies)
  },
}
