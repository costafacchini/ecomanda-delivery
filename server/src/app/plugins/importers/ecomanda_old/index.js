const Licensee = require('@models/Licensee')
const { Client } = require('pg')
const URLParser = require('url')
const importContact = require('./importContact')
const importRoom = require('./importRoom')

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
      const response = await importContact(row.chatRef, row.name, row.chatBot, licensee)
      if (response.success) {
        const contact = response.contact
        await importRoom(row.room, contact)
      } else {
        console.log(response.error)
      }
    }

    await client.end()
  }
}

module.exports = EcomandaOldImporter
