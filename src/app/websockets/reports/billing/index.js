import { io } from '../../../../config/http'
import { BillingQuery } from '../../../../app/queries/BillingQuery.js'
import { IntegrationlogsQuery } from '../../../../app/queries/IntegrationlogsQuery.js'
import { LicenseeRepositoryDatabase } from '../../../../app/repositories/licensee.js'
import { MessageRepositoryDatabase } from '../../../../app/repositories/message.js'
import { IntegrationlogRepositoryDatabase } from '../../../../app/repositories/integrationlog.js'

const licenseeRepository = new LicenseeRepositoryDatabase()
const messageRepository = new MessageRepositoryDatabase()
const integrationlogRepository = new IntegrationlogRepositoryDatabase()

io.on('connect', (socket) => {
  socket.on('load_billing_report', async (params) => {
    const { reportDate } = params

    const billingQuery = new BillingQuery(new Date(reportDate), { licenseeRepository, messageRepository })
    const records = await billingQuery.all()

    io.emit('send_billing_report', { data: records })
  })

  socket.on('load_integrationlog', async (params) => {
    const { startDate, endDate, licensee } = params

    const billingQuery = new IntegrationlogsQuery({ integrationlogRepository })
    billingQuery.filterByCreatedAt(new Date(startDate), new Date(endDate))
    billingQuery.sortBy('createdAt', 'asc')

    if (licensee) billingQuery.filterByLicensee(licensee)

    const records = await billingQuery.all()

    io.emit('send_integrationlog', { data: records })
  })
})
