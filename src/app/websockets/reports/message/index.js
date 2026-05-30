import { io } from '../../../../config/http'
import { LicenseeMessagesByDayQuery } from '../../../../app/queries/LicenseeMessagesByDayQuery'
import { LicenseeRepositoryDatabase } from '../../../../app/repositories/licensee'
import { MessageRepositoryDatabase } from '../../../../app/repositories/message'

const licenseeRepository = new LicenseeRepositoryDatabase()
const messageRepository = new MessageRepositoryDatabase()

io.on('connect', (socket) => {
  socket.on('load_licensees_messages_by_day', async (params) => {
    const { initialDate, endDate, licensee } = params
    const report = new LicenseeMessagesByDayQuery(new Date(initialDate), new Date(endDate), {
      messageRepository,
      licenseeRepository,
    })

    if (licensee) {
      report.filterByLicensee(licensee)
    }

    const records = await report.all()

    io.emit('send_licensees_messages_by_day', { data: records })
  })
})
