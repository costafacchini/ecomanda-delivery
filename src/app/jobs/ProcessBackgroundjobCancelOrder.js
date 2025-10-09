import processBackgroundjobGetPix from '../services/ProcessBackgroundjobGetPix.js'

export default {
  key: 'process-backgroundjob-cancel-order',
  async handle(data) {
    return await processBackgroundjobGetPix(data.body)
  },
}
