import { processBackgroundjob } from '../services/ProcessBackgroundjob'
import { jobDependencies } from './dependencies'

export default {
  key: 'background-job',
  workerEnabled: true,
  async handle(data: any) {
    return await processBackgroundjob(data.body, jobDependencies)
  },
}
