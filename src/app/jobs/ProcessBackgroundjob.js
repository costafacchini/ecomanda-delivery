import { processBackgroundjob } from '../services/ProcessBackgroundjob.js'

export default {
  key: 'background-job',
  async handle(data) {
    return await processBackgroundjob(data.body)
  },
}
