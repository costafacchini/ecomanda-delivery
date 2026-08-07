import { v4 as uuidv4 } from 'uuid'
import Repository, { RepositoryMemory, comparableValue, sortRecords, stringifyObjectIds } from './repository'
import Message from '../models/Message'
import Trigger from '../models/Trigger'
import { replace } from '../helpers/Emoji'
import { requireDependency } from '../helpers/RequireDependency'
import { IMessage, MessageKind, MessageDestination } from '../../types'

class MessageRepositoryDatabase extends Repository<IMessage> {
  parseTextDependency: any

  constructor({ parseText: parseTextDependency }: { parseText?: any } = {}) {
    super()
    this.parseTextDependency = parseTextDependency
  }

  model() {
    return Message
  }

  async create(fields: Partial<IMessage> = {}): Promise<IMessage> {
    return await super.create({ number: uuidv4(), ...fields })
  }

  async findByRoom(roomId: any, options: { since?: Date } = {}) {
    const query: Record<string, any> = { room: roomId }
    if (options.since) {
      query.createdAt = { $gt: options.since }
    }
    const docs = await Message.find(query).sort({ createdAt: 1 }).lean()
    return docs.map((doc: any) => stringifyObjectIds(doc)) as IMessage[]
  }

  async createInteractiveMessages(fields: any) {
    const messages: IMessage[] = []

    const text = replace(fields.text)

    const triggers = await Trigger.find({ expression: text, licensee: fields.licensee }).sort({ order: 'asc' })
    if (triggers.length > 0) {
      for (const trigger of triggers) {
        messages.push(
          await this.create({
            ...fields,
            kind: MessageKind.Interactive,
            text,
            trigger: trigger._id,
          }),
        )
      }
    } else {
      messages.push(
        await this.create({
          ...fields,
          kind: MessageKind.Text,
          text,
        }),
      )
    }

    return messages
  }

  async createTextMessageInsteadInteractive(fields: any) {
    let { kind, text, contact } = fields

    if (kind === MessageKind.Interactive) {
      kind = MessageKind.Text
      text = await requireDependency(this.parseTextDependency, 'parseText', 'MessageRepositoryDatabase')(text, contact)
    }

    return await this.create({ ...fields, kind, text, contact })
  }

  async createMessageToWarnAboutWindowOfWhatsassHasExpired(contact: any, licensee: any) {
    return await this.create({
      number: uuidv4(),
      kind: MessageKind.Text,
      contact,
      licensee,
      destination: MessageDestination.ToChat,
      text: '🚨 ATENÇÃO\nO período de 24h para manter conversas expirou. Envie um Template para voltar a interagir com esse contato.',
    })
  }

  async createMessageToWarnAboutWindowOfWhatsassIsEnding(contact: any, licensee: any) {
    return await this.create({
      number: uuidv4(),
      kind: MessageKind.Text,
      contact,
      licensee,
      destination: MessageDestination.ToChat,
      text: '🚨 ATENÇÃO\nO período de 24h para manter conversas está quase expirando. Faltam apenas 10 minutos para encerrar.',
    })
  }
}

class MessageRepositoryMemory extends RepositoryMemory<IMessage> {
  triggerRepository: any
  parseTextDependency: any

  constructor({
    items = [],
    triggerRepository,
    parseText: parseTextDependency,
  }: { items?: any[]; triggerRepository?: any; parseText?: any } = {}) {
    super(items)
    this.triggerRepository = triggerRepository
    this.parseTextDependency = parseTextDependency
  }

  async create(fields: Partial<IMessage> = {}): Promise<IMessage> {
    return await super.create({ number: uuidv4(), ...(fields ?? {}) })
  }

  findByRoom(roomId: any, options: { since?: Date } = {}) {
    const messages = this.items.filter((m: any) => {
      const roomMatch = comparableValue(m.room) === comparableValue(roomId)
      if (!roomMatch) return false
      if (options.since && m.createdAt) {
        return new Date(m.createdAt) > options.since
      }
      return true
    })
    return sortRecords(messages, { createdAt: 'asc' })
  }

  async createInteractiveMessages(fields: any) {
    const triggerRepository = requireDependency(this.triggerRepository, 'triggerRepository', 'MessageRepositoryMemory')
    const messages: IMessage[] = []

    const text = replace(fields.text)
    const triggers = await triggerRepository.find({ expression: text, licensee: fields.licensee }, { order: 'asc' })

    if (triggers.length > 0) {
      for (const trigger of triggers) {
        messages.push(
          await this.create({
            ...fields,
            kind: MessageKind.Interactive,
            text,
            trigger: trigger._id,
          }),
        )
      }
    } else {
      messages.push(
        await this.create({
          ...fields,
          kind: MessageKind.Text,
          text,
        }),
      )
    }

    return messages
  }

  async createTextMessageInsteadInteractive(fields: any) {
    let { kind, text, contact } = fields

    if (kind === MessageKind.Interactive) {
      kind = MessageKind.Text
      text = await requireDependency(this.parseTextDependency, 'parseText', 'MessageRepositoryMemory')(text, contact)
    }

    return await this.create({ ...fields, kind, text, contact })
  }

  async createMessageToWarnAboutWindowOfWhatsassHasExpired(contact: any, licensee: any) {
    return await this.create({
      number: uuidv4(),
      kind: MessageKind.Text,
      contact,
      licensee,
      destination: MessageDestination.ToChat,
      text: '🚨 ATENÇÃO\nO período de 24h para manter conversas expirou. Envie um Template para voltar a interagir com esse contato.',
    })
  }

  async createMessageToWarnAboutWindowOfWhatsassIsEnding(contact: any, licensee: any) {
    return await this.create({
      number: uuidv4(),
      kind: MessageKind.Text,
      contact,
      licensee,
      destination: MessageDestination.ToChat,
      text: '🚨 ATENÇÃO\nO período de 24h para manter conversas está quase expirando. Faltam apenas 10 minutos para encerrar.',
    })
  }
}

export { MessageRepositoryDatabase, MessageRepositoryMemory }
