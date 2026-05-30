import { resetCarts } from '../services/ResetCarts'
import { jobDependencies } from './dependencies'

export default {
  key: 'reset-carts',
  workerEnabled: true,
  async handle(data: any) {
    return await resetCarts(jobDependencies)
  },
}
