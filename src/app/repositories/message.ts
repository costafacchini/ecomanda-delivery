import { v4 as uuidv4 } from 'uuid'
import Repository, { RepositoryMemory } from './repository'
import Message from '../models/Message'
import Trigger from '../models/Trigger'
import { replace } from '../helpers/Emoji'
import { requireDependency } from '../helpers/RequireDependency'

class MessageRepositoryDatabase extends Repository {
  parseTextDependency: any

  constructor({ parseText: parseTextDependency }: { parseText?: any } = {}) {
    super()
    this.parseTextDependency = parseTextDependency
  }

  model() {
    return Message
  }

  async findFirst(params: any = {}, relations: any[] = []) {
    if (relations) {
      const query = Message.findOne(params)
      relations.forEach((relation: any) => query.populate(relation))

      return await query
    } else {
      return await Message.findOne(params)
    }
  }

  async create(fields: any = {}) {
    return await Message.create({ number: uuidv4(), ...fields })
  }

  async update(id: any, fields: any = {}) {
    return await Message.updateOne({ _id: id }, { $set: fields }, { runValidators: true })
  }

  async find(params: any = {}) {
    return await Message.find(params)
  }

  async createInteractiveMessages(fields: any) {
    const messages: any[] = []

    const text = replace(fields.text)

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

  async createTextMessageInsteadInteractive(fields: any) {
    let { kind, text, contact } = fields

    if (kind === 'interactive') {
      kind = 'text'
      text = await requireDependency(this.parseTextDependency, 'parseText', 'MessageRepositoryDatabase')(text, contact)
    }

    return await this.create({ ...fields, kind, text, contact })
  }

  async createMessageToWarnAboutWindowOfWhatsassHasExpired(contact: any, licensee: any) {
    return await this.create({
      number: uuidv4(),
      kind: 'text',
      contact,
      licensee,
      destination: 'to-chat',
      text: '🚨 ATENÇÃO\nO período de 24h para manter conversas expirou. Envie um Template para voltar a interagir com esse contato.',
    })
  }

  async createMessageToWarnAboutWindowOfWhatsassIsEnding(contact: any, licensee: any) {
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

class MessageRepositoryMemory extends RepositoryMemory {
  triggerRepository: any
  parseTextDependency: any

  constructor({ items = [], triggerRepository, parseText: parseTextDependency }: { items?: any[]; triggerRepository?: any; parseText?: any } = {}) {
    super(items)
    this.triggerRepository = triggerRepository
    this.parseTextDependency = parseTextDependency
  }

  async create(fields: any = {}) {
    return await super.create({ number: uuidv4(), ...(fields ?? {}) })
  }

  async createInteractiveMessages(fields: any) {
    const triggerRepository = requireDependency(this.triggerRepository, 'triggerRepository', 'MessageRepositoryMemory')
    const messages: any[] = []

    const text = replace(fields.text)
    const triggers = await triggerRepository.find({ expression: text, licensee: fields.licensee }, { order: 'asc' })

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

  async createTextMessageInsteadInteractive(fields: any) {
    let { kind, text, contact } = fields

    if (kind === 'interactive') {
      kind = 'text'
      text = await requireDependency(this.parseTextDependency, 'parseText', 'MessageRepositoryMemory')(text, contact)
    }

    return await this.create({ ...fields, kind, text, contact })
  }

  async createMessageToWarnAboutWindowOfWhatsassHasExpired(contact: any, licensee: any) {
    return await this.create({
      number: uuidv4(),
      kind: 'text',
      contact,
      licensee,
      destination: 'to-chat',
      text: '🚨 ATENÇÃO\nO período de 24h para manter conversas expirou. Envie um Template para voltar a interagir com esse contato.',
    })
  }

  async createMessageToWarnAboutWindowOfWhatsassIsEnding(contact: any, licensee: any) {
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

export { MessageRepositoryDatabase, MessageRepositoryMemory }
