import processBackgroundjobGetPix from '../services/ProcessBackgroundjobGetPix'

export default {
  key: 'process-backgroundjob-cancel-order',
  async handle(data) {
    return await processBackgroundjobGetPix(data.body)
  },
}
