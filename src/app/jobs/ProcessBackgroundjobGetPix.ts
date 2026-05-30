import { processBackgroundjobGetPix } from '../services/ProcessBackgroundjobGetPix'
import { jobDependencies } from './dependencies'

export default {
  key: 'process-backgroundjob-get-pix',
  workerEnabled: true,
  async handle(data: any) {
    return await processBackgroundjobGetPix(data.body, jobDependencies)
  },
}
