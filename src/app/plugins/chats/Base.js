import { ContactRepositoryDatabase } from '../../repositories/contact.js'
import { MessageRepositoryDatabase } from '../../repositories/message.js'
import { TriggerRepositoryDatabase } from '../../repositories/trigger.js'
import Repository from '../../repositories/repository.js'
import { replace } from '../../helpers/Emoji.js'
import { v4 as uuidv4 } from 'uuid'

class ChatsBase {
  constructor(licensee, { contactRepository, messageRepository, triggerRepository } = {}) {
    this.licensee = licensee
    this._contactRepository = contactRepository
    this._messageRepository = messageRepository
    this._triggerRepository = triggerRepository
  }

  get contactRepository() {
    this._contactRepository ??= new ContactRepositoryDatabase()
    if (typeof this._contactRepository.save !== 'function') {
      this._contactRepository.save = Repository.prototype.save.bind(this._contactRepository)
    }
    return this._contactRepository
  }

  get messageRepository() {
    this._messageRepository ??= new MessageRepositoryDatabase()
    if (typeof this._messageRepository.save !== 'function') {
      this._messageRepository.save = Repository.prototype.save.bind(this._messageRepository)
    }
    return this._messageRepository
  }

  get triggerRepository() {
    this._triggerRepository ??= new TriggerRepositoryDatabase()
    return this._triggerRepository
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
          const text = message.text.body ? replace(message.text.body) : ''

          const triggers = await this.triggerRepository.find(
            { expression: text, licensee: this.licensee._id },
            { order: 'asc' },
          )
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

export { ChatsBase }
