import { io } from '../../../../config/http.js'
import { LicenseeMessagesByDayQuery } from '../../../../app/queries/LicenseeMessagesByDayQuery.js'

io.on('connect', (socket) => {
  socket.on('load_licensees_messages_by_day', async (params) => {
    const { initialDate, endDate, licensee } = params
    const report = new LicenseeMessagesByDayQuery(new Date(initialDate), new Date(endDate))

    if (licensee) {
      report.filterByLicensee(licensee)
    }

    const records = await report.all()

    io.emit('send_licensees_messages_by_day', { data: records })
  })
})
