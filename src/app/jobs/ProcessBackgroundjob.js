import { processBackgroundjob } from '../services/ProcessBackgroundjob'
import { jobDependencies } from './dependencies.js'

export default {
  key: 'background-job',
  workerEnabled: true,
  async handle(data) {
    return await processBackgroundjob(data.body, jobDependencies)
  },
}
