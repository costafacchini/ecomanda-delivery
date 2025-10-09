import processBackgroundjobGetCreditCard from '../services/ProcessBackgroundjobGetCreditCard.js'

export default {
  key: 'process-backgroundjob-get-credit-card',
  async handle(data) {
    return await processBackgroundjobGetCreditCard(data.body)
  },
}
