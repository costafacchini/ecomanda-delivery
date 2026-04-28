import { changeOrderStatus } from '../services/Pedidos10ChangeOrderStatus.js'
import { jobDependencies } from './dependencies.js'

export default {
  key: 'pedidos10-change-order-status',
  workerEnabled: true,
  async handle(data) {
    return await changeOrderStatus(data.body, jobDependencies)
  },
}
