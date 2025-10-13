import { io } from '../../../../config/http.js'
import { BillingQuery } from '../../../../app/queries/BillingQuery.js'
import { IntegrationlogsQuery } from '../../../../app/queries/IntegrationlogsQuery.js'

io.on('connect', (socket) => {
  socket.on('load_billing_report', async (params) => {
    const { reportDate } = params

    const billingQuery = new BillingQuery(new Date(reportDate))
    const records = await billingQuery.all()

    io.emit('send_billing_report', { data: records })
  })

  socket.on('load_integrationlog', async (params) => {
    const { startDate, endDate, licensee } = params

    const billingQuery = new IntegrationlogsQuery()
    billingQuery.filterByCreatedAt(new Date(startDate), new Date(endDate))
    billingQuery.sortBy('createdAt', 'asc')

    if (licensee) billingQuery.filterByLicensee(licensee)

    const records = await billingQuery.all()

    io.emit('send_integrationlog', { data: records })
  })
})
