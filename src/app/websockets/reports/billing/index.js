const { io } = require('@config/http')
const BillingQuery = require('@queries/BillingQuery')

io.on('connect', (socket) => {
  socket.on('load_billing_report', async (params) => {
    const { reportDate } = params

    const billingQuery = new BillingQuery(new Date(reportDate))
    const records = await billingQuery.all()

    io.emit('send_billing_report', { data: records })
  })
})
