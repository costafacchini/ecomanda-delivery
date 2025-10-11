import processBackgroundjobGetPix from '../services/ProcessBackgroundjobGetPix'

export default {
  key: 'process-backgroundjob-get-pix',
  async handle(data) {
    return await processBackgroundjobGetPix(data.body)
  },
}
