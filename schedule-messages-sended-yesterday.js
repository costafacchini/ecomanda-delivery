require('dotenv').config()
require('module-alias/register')
require('@models/index')
const moment = require('moment')

const request = require('./src/app/services/request')
const Licensee = require('@models/Licensee')
const MessagesSendedQuery = require('@queries/MessagesSended')
const MessagesFailedQuery = require('@queries/MessagesFailed')
const connect = require('./src/config/database')
connect()

async function schedule() {
  // Fazer um HTML
  // Disparar um e-mail
  const yesterday = moment().subtract(1, 'days')
  const startDate = moment(yesterday).startOf('day')
  const endDate = moment(yesterday).endOf('day')

  const licenseeMessages = []
  const licensees = await Licensee.find({ licenseKind: 'paid' })
  for (const licensee of licensees) {
    const messagesSendedQuery = new MessagesSendedQuery(startDate, endDate, licensee._id)
    const messages = await messagesSendedQuery.all()

    const messagesFaliedQuery = new MessagesFailedQuery(startDate, endDate, licensee._id)
    const messagesFailed = await messagesFaliedQuery.all()

    const record = {
      licensee: licensee,
      success: {
        count: messages.length,
        messages: messages,
      },
      error: {
        count: messagesFailed.length,
        messages: messagesFailed,
      },
    }

    licenseeMessages.push(record)
  }

  // This command is necessary to wake up the heroku application
  await request.get('https://ecomanda-delivery.herokuapp.com/resources')
  // process.exit()
}

schedule()
