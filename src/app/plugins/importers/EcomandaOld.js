const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const { Client } = require('pg')
const URLParser = require('url')
const { sanitizeModelErrors } = require('../../helpers/SanitizeErrors')

class EcomandaOldImporter {
  constructor(licenseeId, databaseUrl) {
    this.licenseeId = licenseeId
    this.databaseUrl = databaseUrl
  }

  async importContacts() {
    const licensee = await Licensee.findById(this.licenseeId)
    const databaseUri = new URLParser.URL(this.databaseUrl)

    const client = new Client({
      user: databaseUri.username,
      host: databaseUri.hostname,
      database: databaseUri.pathname.replace(/[^aA-zZ0-9]/gi, ''),
      password: databaseUri.password,
      port: 5432,
      ssl: {
        rejectUnauthorized: false,
      },
    })

    await client.connect()

    const data = await client.query(`
      Select
        chat.name,
            chat."chatBot",
            chat."chatRef",
            chat.type,
            contact.author,
            contact.number,
            contact."senderName",
            rocket.room,
            rocket.closed
      From
        "ChatsContacts" cc
        left join
          "Chats" chat
        on
          cc."ChatId" = chat.id
        left join
          "Contacts" contact
        on
          cc."ContactId" = contact.id
        left join
          "RocketChatChannels" rocket
        on
          cc."ChatId" = rocket."ChatId"
    `)
    for (const row of data.rows) {
      const contact = new Contact({
        name: row.name,
        number: row.number,
        talkingWithChatBot: row.chatBot !== 'chat',
        licensee: licensee._id,
      })
      if (row.room) contact.roomId = row.room

      const validation = contact.validateSync()
      if (validation) {
        console.log(
          `Contato não importado: ${row.name} - ${row.number} motivo: ${sanitizeModelErrors(validation.errors)}`
        )
      } else {
        await contact.save()
      }
    }

    await client.end()
  }
}

module.exports = EcomandaOldImporter
