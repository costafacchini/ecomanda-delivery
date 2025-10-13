import { processBackgroundjobChargeCreditCard } from '../services/ProcessBackgroundjobChargeCreditCard.js'

export default {
  key: 'process-backgroundjob-charge-credit-card',
  async handle(data) {
    return await processBackgroundjobChargeCreditCard(data.body)
  },
}
