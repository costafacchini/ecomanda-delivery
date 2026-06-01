import { changeOrderStatus } from '../services/Pedidos10ChangeOrderStatus'
import { jobDependencies } from './dependencies'

export default {
  key: 'pedidos10-change-order-status',
  workerEnabled: true,
  async handle(data: any) {
    return await changeOrderStatus(data.body, jobDependencies)
  },
}
