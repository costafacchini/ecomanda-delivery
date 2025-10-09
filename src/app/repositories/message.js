import { v4 as uuidv4   } from 'uuid'
import Repository from './repository.js'
import Message from '@models/Message.js'
import Trigger from '@models/Trigger.js'
import { parseText  } from '@helpers/ParseTriggerText.js'
import emoji from '@helpers/Emoji.js'

class MessageRepositoryDatabase extends Repository {
  model() {
    return Message
  }

  async findFirst(params, relations) {
    if (relations) {
      const query = Message.findOne(params)
      relations.forEach((relation) => query.populate(relation))

      return await query
    } else {
      return await Message.findOne(params)
    }
  }

  async create(fields) {
    return await Message.create({ number: uuidv4(), ...fields })
  }

  async update(id, fields) {
    return await Message.updateOne({ _id: id }, { $set: fields }, { runValidators: true })
  }

  async find(params) {
    return await Message.find(params)
  }

  async createInteractiveMessages(fields) {
    const messages = []

    const text = emoji.replace(fields.text)

    const triggers = await Trigger.find({ expression: text, licensee: fields.licensee }).sort({ order: 'asc' })
    if (triggers.length > 0) {
      for (const trigger of triggers) {
        messages.push(
          await this.create({
            ...fields,
            kind: 'interactive',
            text,
            trigger: trigger._id,
          }),
        )
      }
    } else {
      messages.push(
        await this.create({
          ...fields,
          kind: 'text',
          text,
        }),
      )
    }

    return messages
  }

  async createTextMessageInsteadInteractive(fields) {
    let { kind, text, contact } = fields

    if (kind === 'interactive') {
      kind = 'text'
      text = await parseText(text, contact)
    }

    return await this.create({ ...fields, kind, text, contact })
  }

  async createMessageToWarnAboutWindowOfWhatsassHasExpired(contact, licensee) {
    return await this.create({
      number: uuidv4(),
      kind: 'text',
      contact,
      licensee,
      destination: 'to-chat',
      text: '🚨 ATENÇÃO\nO período de 24h para manter conversas expirou. Envie um Template para voltar a interagir com esse contato.',
    })
  }

  async createMessageToWarnAboutWindowOfWhatsassIsEnding(contact, licensee) {
    return await this.create({
      number: uuidv4(),
      kind: 'text',
      contact,
      licensee,
      destination: 'to-chat',
      text: '🚨 ATENÇÃO\nO período de 24h para manter conversas está quase expirando. Faltam apenas 10 minutos para encerrar.',
    })
  }
}

export default { MessageRepositoryDatabase }
