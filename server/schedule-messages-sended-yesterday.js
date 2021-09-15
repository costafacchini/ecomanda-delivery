require('dotenv').config()
require('module-alias/register')
require('@models/index')
const MessagesSendedYesterday = require('@reports/MessagesSendedYesterday')

const request = require('./src/app/services/request')
const connect = require('./src/config/database')
connect()

async function schedule() {
  // Disparar uma mensagem utilizando o whatsapp do liceniado teste
  const messagesSendedYesterday = new MessagesSendedYesterday()
  const reportData = await messagesSendedYesterday.report()

  for (const data of reportData) {
    console.log(
      `Licenciado - ${data.licensee.name}\nMensagens disparadas com sucesso: ${data.success.count}\nMensagens não disparadas: ${data.error.count}\n\n`
    )
  }

  // This command is necessary to wake up the heroku application
  await request.get('https://ecomanda-delivery.herokuapp.com/resources')
  // process.exit()
}

schedule()
