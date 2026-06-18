import Repository from '../../repositories/repository'
import { replace } from '../../helpers/Emoji'
import { v4 as uuidv4 } from 'uuid'
import { requireDependency } from '../../helpers/RequireDependency'

class ChatsBase {
  licensee: any
  _contactRepository: any
  _messageRepository: any
  _triggerRepository: any
  messageParsed: any

  // Implemented by subclasses
  parseMessage(_responseBody: any): Promise<any> | any {
    return
  }

  constructor(licensee: any, { contactRepository, messageRepository, triggerRepository }: Record<string, any> = {}) {
    this.licensee = licensee
    this._contactRepository = contactRepository
    this._messageRepository = messageRepository
    this._triggerRepository = triggerRepository
  }

  get contactRepository() {
    const repository = requireDependency(this._contactRepository, 'contactRepository', this.constructor.name)
    if (typeof repository.save !== 'function') {
      repository.save = Repository.prototype.save.bind(repository)
    }
    return repository
  }

  get messageRepository() {
    const repository = requireDependency(this._messageRepository, 'messageRepository', this.constructor.name)
    if (typeof repository.save !== 'function') {
      repository.save = Repository.prototype.save.bind(repository)
    }
    return repository
  }

  get triggerRepository() {
    return requireDependency(this._triggerRepository, 'triggerRepository', this.constructor.name)
  }

  async findContact(filters: any) {
    return await this.contactRepository.findFirst(filters)
  }

  async responseToMessages(responseBody: any) {
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
          sector: this.messageParsed.room?.sector ?? null,
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
                  sector: this.messageParsed.room?.sector ?? null,
                  destination: 'to-messenger',
                  trigger: trigger._id,
                }),
              )
            }
          } else {
            const messageToSend: Record<string, any> = {
              number: uuidv4(),
              kind: 'text',
              text,
              licensee: this.licensee._id,
              contact: this.messageParsed.contact._id,
              room: this.messageParsed.room?._id || this.messageParsed.room,
              sector: this.messageParsed.room?.sector ?? null,
              destination: 'to-messenger',
              senderName: message.senderName,
            }

            if (messageToSend.text.includes('{{') && messageToSend.text.includes('}}')) {
              messageToSend.kind = 'template'
            }

            processedMessages.push(await this.messageRepository.create(messageToSend))
          }
        } else if (message.kind === 'file') {
          const messageToSend: Record<string, any> = {
            number: uuidv4(),
            kind: 'file',
            licensee: this.licensee._id,
            contact: this.messageParsed.contact._id,
            room: this.messageParsed.room?._id || this.messageParsed.room,
            sector: this.messageParsed.room?.sector ?? null,
            destination: 'to-messenger',
            senderName: message.senderName,
          }

          messageToSend.text = message.file.text
          messageToSend.fileName = message.file.fileName
          messageToSend.url = message.file.url

          processedMessages.push(await this.messageRepository.create(messageToSend))
        } else if (message.kind === 'location') {
          const messageToSend: Record<string, any> = {
            number: uuidv4(),
            kind: 'location',
            licensee: this.licensee._id,
            contact: this.messageParsed.contact._id,
            room: this.messageParsed.room?._id || this.messageParsed.room,
            sector: this.messageParsed.room?.sector ?? null,
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
