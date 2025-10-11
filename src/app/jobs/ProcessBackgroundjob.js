import processBackgroundjob from '../services/ProcessBackgroundjob'

export default {
  key: 'background-job',
  async handle(data) {
    return await processBackgroundjob(data.body)
  },
}
