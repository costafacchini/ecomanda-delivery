import { processBackgroundjobGetPix } from '../services/ProcessBackgroundjobGetPix.js'

export default {
  key: 'process-backgroundjob-get-pix',
  workerEnabled: true,
  async handle(data) {
    return await processBackgroundjobGetPix(data.body)
  },
}
