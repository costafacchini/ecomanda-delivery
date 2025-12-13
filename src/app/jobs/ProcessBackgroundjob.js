import { processBackgroundjob } from '../services/ProcessBackgroundjob.js'

export default {
  key: 'background-job',
  workerEnabled: true,
  async handle(data) {
    return await processBackgroundjob(data.body)
  },
}
