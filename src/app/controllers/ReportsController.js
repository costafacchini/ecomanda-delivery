const MessagesSendedYesterday = require('@reports/MessagesSendedYesterday')
const moment = require('moment')

class ReportsController {
  async messagesSendedYesterday(req, res) {
    const yesterday = moment().subtract(1, 'days')
    this.startDate = moment(yesterday).startOf('day')
    this.endDate = moment(yesterday).endOf('day')

    const messagesSendedYesterday = new MessagesSendedYesterday()
    const reportData = await messagesSendedYesterday.report()

    for (const data of reportData) {
      console.log(
        `Licenciado - ${data.licensee.name}\nMensagens disparadas com sucesso: ${data.success.count}\nMensagens não disparadas: ${data.error.count}\n\n`
      )
    }

    res.status(200).send(messages)
  }
}

module.exports = ReportsController
