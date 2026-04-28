import 'dotenv/config'
import 'module-alias/register'
import '@models/index'
import MessagesSendedYesterday from '@reports/MessagesSendedYesterday'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { MessageRepositoryDatabase } from '@repositories/message'

import request from './src/app/services/request'
import connect from './src/config/database'
connect()

async function schedule() {
  // Disparar uma mensagem utilizando o whatsapp do liceniado teste
  const messagesSendedYesterday = new MessagesSendedYesterday({
    licenseeRepository: new LicenseeRepositoryDatabase(),
    messageRepository: new MessageRepositoryDatabase(),
  })
  const reportData = await messagesSendedYesterday.report()

  for (const data of reportData) {
    console.log(
      `Licenciado - ${data.licensee.name}\nMensagens disparadas com sucesso: ${data.success.count}\nMensagens não disparadas: ${data.error.count}\n\n`,
    )
  }

  // This command is necessary to wake up the heroku application
  await request.get('https://clave-digital.herokuapp.com/resources')
  // process.exit()
}

schedule()
