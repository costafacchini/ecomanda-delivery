import { resetCarts } from '../services/ResetCarts'
import { jobDependencies } from './dependencies.js'

export default {
  key: 'reset-carts',
  workerEnabled: true,
  async handle(data) {
    return await resetCarts(data.body, jobDependencies)
  },
}
