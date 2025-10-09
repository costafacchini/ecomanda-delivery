const Trigger = require('@models/Trigger')
const { ContactRepositoryDatabase } = require('@repositories/contact')
const { MessageRepositoryDatabase } = require('@repositories/message')
const emoji = require('@helpers/Emoji')
const { v4: uuidv4 } = require('uuid')

class ChatsBase {
  constructor(licensee) {
    this.licensee = licensee
    this.contactRepository = new ContactRepositoryDatabase()
    this.messageRepository = new MessageRepositoryDatabase()
  }

  async findContact(filters) {
    return await this.contactRepository.findFirst(filters)
  }

  async responseToMessages(responseBody) {
    await this.parseMessage(responseBody)
    if (!this.messageParsed) return []

    const processedMessages = []

    if (this.messageParsed.action === 'close-chat') {
      processedMessages.push(
        await this.messageRepository.create({
          number: uuidv4(),
          text: 'Chat encerrado pelo agente',
          kind: 'text',
          licensee: this.licensee._id,
          contact: this.messageParsed.contact._id,
          room: this.messageParsed.room?._id || this.messageParsed.room,
          destination: 'to-messenger',
        }),
      )
    } else {
      for (const message of this.messageParsed.messages) {
        if (message.kind === 'text') {
          const text = message.text.body ? emoji.replace(message.text.body) : ''

          const triggers = await Trigger.find({ expression: text, licensee: this.licensee._id }).sort({ order: 'asc' })
          if (triggers.length > 0) {
            for (const trigger of triggers) {
              processedMessages.push(
                await this.messageRepository.create({
                  number: uuidv4(),
                  kind: 'interactive',
                  text,
                  licensee: this.licensee._id,
                  contact: this.messageParsed.contact._id,
                  room: this.messageParsed.room?._id || this.messageParsed.room,
                  destination: 'to-messenger',
                  trigger: trigger._id,
                }),
              )
            }
          } else {
            const messageToSend = {
              number: uuidv4(),
              kind: 'text',
              text,
              licensee: this.licensee._id,
              contact: this.messageParsed.contact._id,
              room: this.messageParsed.room?._id || this.messageParsed.room,
              destination: 'to-messenger',
              senderName: message.senderName,
            }

            if (messageToSend.text.includes('{{') && messageToSend.text.includes('}}')) {
              messageToSend.kind = 'template'
            }

            processedMessages.push(await this.messageRepository.create(messageToSend))
          }
        } else if (message.kind === 'file') {
          const messageToSend = {
            number: uuidv4(),
            kind: 'file',
            licensee: this.licensee._id,
            contact: this.messageParsed.contact._id,
            room: this.messageParsed.room?._id || this.messageParsed.room,
            destination: 'to-messenger',
            senderName: message.senderName,
          }

          messageToSend.text = message.file.text
          messageToSend.fileName = message.file.fileName
          messageToSend.url = message.file.url

          processedMessages.push(await this.messageRepository.create(messageToSend))
        } else if (message.kind === 'location') {
          const messageToSend = {
            number: uuidv4(),
            kind: 'location',
            licensee: this.licensee._id,
            contact: this.messageParsed.contact._id,
            room: this.messageParsed.room?._id || this.messageParsed.room,
            destination: 'to-messenger',
            senderName: message.senderName,
          }

          messageToSend.latitude = message.location.latitude
          messageToSend.longitude = message.location.longitude

          processedMessages.push(await this.messageRepository.create(messageToSend))
        }
      }
    }

    return processedMessages
  }
}

module.exports = ChatsBase
