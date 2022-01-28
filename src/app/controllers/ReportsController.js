const BillingQuery = require('@queries/BillingQuery')

class ReportsController {
  async billing(req, res) {
    try {
      const billingQuery = new BillingQuery(req.query.reportDate)
      const records = await billingQuery.all()

      res.status(200).send(records)
    } catch (err) {
      res.status(500).send({ errors: { message: err.toString() } })
    }
  }
}

module.exports = ReportsController
