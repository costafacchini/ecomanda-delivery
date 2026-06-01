import { processPagarmeOrderPaid } from '../services/ProcessPagarmeOrderPaid'
import { jobDependencies } from './dependencies'

export default {
  key: 'process-pagarme-order-paid',
  workerEnabled: true,
  async handle(data: any) {
    return await processPagarmeOrderPaid(data.body, jobDependencies)
  },
}
