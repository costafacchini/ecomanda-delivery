import Body from '../models/Body'
import Contact from '../models/Contact'
import Licensee from '../models/Licensee'
import Message from '../models/Message'
import Room from '../models/Room'
import Template from '../models/Template'
import Trigger from '../models/Trigger'
import User from '../models/User'
import WhatsappSession from '../models/WhatsappSession'
import Department from '../models/Department'
import { BodyRepositoryDatabase, BodyRepositoryMemory } from './body'
import { ContactRepositoryDatabase, ContactRepositoryMemory } from './contact'
import { LicenseeRepositoryDatabase, LicenseeRepositoryMemory } from './licensee'
import { MessageRepositoryDatabase, MessageRepositoryMemory } from './message'
import { RoomRepositoryDatabase, RoomRepositoryMemory } from './room'
import { TemplateRepositoryDatabase, TemplateRepositoryMemory } from './template'
import { TrafficlightRepositoryMemory } from './trafficlight'
import { TriggerRepositoryDatabase, TriggerRepositoryMemory } from './trigger'
import { UserRepositoryDatabase, UserRepositoryMemory } from './user'
import { WhatsappSessionRepositoryDatabase, WhatsappSessionRepositoryMemory } from './whatsappsession'
import { DepartmentRepositoryDatabase, DepartmentRepositoryMemory } from './department'
import { RepositoryMemory, matchesFilter, sortRecords, comparableValue } from './repository'
import { parseText as parseTextHelper } from '../helpers/ParseTriggerText'

let activeRestore: any = null

function serializeRelations(record: any, relations: any[] = []) {
  if (!record) {
    return record
  }

  const clone = { ...record }

  relations.forEach((relation: any) => {
    if (clone[relation] && typeof clone[relation] === 'object') {
      clone[relation] = clone[relation]._id ?? clone[relation]
    }
  })

  return clone
}

function createMemoryRepositories() {
  const state: Record<string, any[]> = {
    bodies: [] as any[],
    contacts: [] as any[],
    licensees: [] as any[],
    messages: [] as any[],
    rooms: [] as any[],
    templates: [] as any[],
    trafficlights: [] as any[],
    triggers: [] as any[],
    users: [] as any[],
    whatsappSessions: [] as any[],
    departments: [] as any[],
  }

  const triggerRepository = new TriggerRepositoryMemory(state.triggers)
  const parseText = (text: any, contact: any) => parseTextHelper(text, contact, {})
  const messageRepository = new MessageRepositoryMemory({
    items: state.messages,
    triggerRepository,
    parseText,
  })
  const contactRepository = new ContactRepositoryMemory({
    items: state.contacts,
    messageRepository,
  })

  return {
    state,
    bodyRepository: new BodyRepositoryMemory(state.bodies),
    contactRepository,
    licenseeRepository: new LicenseeRepositoryMemory(state.licensees),
    messageRepository,
    roomRepository: new RoomRepositoryMemory(state.rooms),
    templateRepository: new TemplateRepositoryMemory(state.templates),
    trafficlightRepository: new TrafficlightRepositoryMemory(state.trafficlights),
    triggerRepository,
    userRepository: new UserRepositoryMemory(state.users),
    whatsappSessionRepository: new WhatsappSessionRepositoryMemory(state.whatsappSessions),
    departmentRepository: new DepartmentRepositoryMemory(state.departments),
  }
}

class MemoryQuery {
  repository: any
  params: any
  single: boolean
  predicates: any[]
  skipCount: number
  limitCount: number | null
  sortClause: any
  currentField: any
  relations: any[]

  constructor(repository: any, params: any = {}, { single = false } = {}) {
    this.repository = repository
    this.params = params
    this.single = single
    this.predicates = []
    this.skipCount = 0
    this.limitCount = null
    this.sortClause = null
    this.currentField = null
    this.relations = []
  }

  sort(order = {}) {
    this.sortClause = order
    return this
  }

  skip(value = 0) {
    this.skipCount = value
    return this
  }

  limit(value: any) {
    this.limitCount = value
    return this
  }

  where(fieldOrFilter: any = {}) {
    if (typeof fieldOrFilter === 'string') {
      this.currentField = fieldOrFilter
      return this
    }

    this.predicates.push((record: any) => matchesFilter(record, fieldOrFilter))
    return this
  }

  equals(value: any) {
    const field = this.currentField
    this.predicates.push((record: any) => matchesFilter(record, { [field]: value }))
    return this
  }

  ne(value: any) {
    const field = this.currentField
    this.predicates.push((record: any) => matchesFilter(record, { [field]: { $ne: value } }))
    return this
  }

  gt(value: any) {
    const field = this.currentField
    this.predicates.push((record: any) => matchesFilter(record, { [field]: { $gt: value } }))
    return this
  }

  gte(value: any) {
    const field = this.currentField
    this.predicates.push((record: any) => matchesFilter(record, { [field]: { $gte: value } }))
    return this
  }

  lt(value: any) {
    const field = this.currentField
    this.predicates.push((record: any) => matchesFilter(record, { [field]: { $lt: value } }))
    return this
  }

  lte(value: any) {
    const field = this.currentField
    this.predicates.push((record: any) => matchesFilter(record, { [field]: { $lte: value } }))
    return this
  }

  or(filters: any[] = []) {
    this.predicates.push((record: any) => filters.some((filter: any) => matchesFilter(record, filter)))
    return this
  }

  populate(relation: any) {
    this.relations.push(relation)
    return this
  }

  async countDocuments() {
    return (await this.resolve()).length
  }

  async exec() {
    const records = await this.resolve()
    return this.single ? (records[0] ?? null) : records
  }

  then(resolve: any, reject: any) {
    return this.exec().then(resolve, reject)
  }

  async resolve() {
    let records = await this.repository.find(this.params)

    records = records.filter((record: any) => this.predicates.every((predicate: any) => predicate(record)))

    if (this.sortClause) {
      records = sortRecords(records, this.sortClause)
    }

    if (this.skipCount) {
      records = records.slice(this.skipCount)
    }

    if (this.limitCount != null) {
      records = records.slice(0, this.limitCount)
    }

    if (this.relations.length > 0 && typeof this.repository.populateRecords === 'function') {
      records = await this.repository.populateRecords(records, this.relations)
    }

    return records
  }
}

function aggregateMessageCounts(repository: any, pipeline: any[] = []) {
  const matchStage = pipeline.find((stage) => stage?.$match)?.$match ?? {}
  const records = repository.items.filter((record: any) => matchesFilter(record, matchStage))
  const grouped = new Map()

  records.forEach((record: any) => {
    const licenseeId = comparableValue(record.licensee)
    const day = new Date(record.createdAt).toISOString().slice(0, 10)
    const key = `${licenseeId}:${day}`
    const current = grouped.get(key) ?? { _id: { licensee: record.licensee, day }, count: 0 }
    current.count += 1
    grouped.set(key, current)
  })

  const groupedByLicensee = new Map()

  Array.from(grouped.values())
    .sort((left, right) => {
      const leftLicensee = comparableValue(left._id.licensee)
      const rightLicensee = comparableValue(right._id.licensee)

      if (leftLicensee !== rightLicensee) {
        return leftLicensee > rightLicensee ? 1 : -1
      }

      return left._id.day > right._id.day ? 1 : -1
    })
    .forEach((entry: any) => {
      const licenseeKey = comparableValue(entry._id.licensee)
      const current = groupedByLicensee.get(licenseeKey) ?? {
        _id: entry._id.licensee,
        days: [],
      }

      current.days.push({ date: entry._id.day, count: entry.count })
      groupedByLicensee.set(licenseeKey, current)
    })

  return Array.from(groupedByLicensee.values())
}

function createMemoryModelAdapter(repository: any, { aggregate }: { aggregate?: any } = {}) {
  return {
    create: async (fields = {}) => await repository.create(fields),
    find: (params = {}) => new MemoryQuery(repository, params),
    findOne: (params = {}) => new MemoryQuery(repository, params, { single: true }),
    findById: (id: any) => new MemoryQuery(repository, { _id: id?._id ?? id }, { single: true }),
    deleteMany: async (params = {}) => await repository.delete(params),
    where: (params = {}) => new MemoryQuery(repository).where(params),
    aggregate: async (pipeline: any[] = []) => (aggregate ? await aggregate(repository, pipeline) : []),
  }
}

function bindModelToRepository(model: any, repository: any, restores: any) {
  const adapter = createMemoryModelAdapter(repository)

  patchMember(model, 'create', adapter.create, restores)
  patchMember(model, 'find', adapter.find, restores)
  patchMember(model, 'findById', adapter.findById, restores)
  patchMember(model, 'findOne', adapter.findOne, restores)
  patchMember(model, 'deleteMany', adapter.deleteMany, restores)
  patchMember(model, 'where', adapter.where, restores)
}

function bindRepositoryPrototype(prototype: any, repository: any, restores: any) {
  // Stable base CRUD API — explicitly listed to avoid patching Repository internals like model().
  const baseMethods = ['findFirst', 'create', 'update', 'updateMany', 'find', 'delete', 'save']

  // Custom business methods defined directly on the concrete Memory subclass are discovered
  // dynamically so new methods are auto-patched without requiring updates here.
  // RepositoryMemory internals (hydrate, prepareRecord, populateRecords, etc.) are excluded
  // to prevent them from leaking onto Database prototypes.
  const repositoryMemoryOwnMethods = new Set(Object.getOwnPropertyNames(RepositoryMemory.prototype))
  const customMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(repository)).filter(
    (name) => name !== 'constructor' && !repositoryMemoryOwnMethods.has(name),
  )

  ;[...baseMethods, ...customMethods].forEach((method) => {
    if (typeof repository[method] === 'function' && method in prototype) {
      patchMember(prototype, method, repository[method].bind(repository), restores)
    }
  })
}

function patchMember(target: any, key: any, replacement: any, restores: any) {
  const hasOwnProperty = Object.prototype.hasOwnProperty.call(target, key)
  const original = target[key]

  target[key] = replacement

  restores.push(() => {
    if (hasOwnProperty) {
      target[key] = original
      return
    }

    delete target[key]
  })
}

function installMemoryRepositories() {
  resetMemoryRepositories()

  const repositories = createMemoryRepositories()
  const restores: any[] = []
  const loadRelation = (repository: any) => async (value: any) => {
    const identifier = value?._id ?? value

    if (identifier == null) {
      return value
    }

    return await repository.findFirst({ _id: identifier }, [])
  }
  const originalMessageCreate = repositories.messageRepository.create.bind(repositories.messageRepository)
  const originalMessageFind = repositories.messageRepository.find.bind(repositories.messageRepository)
  const originalRoomFind = repositories.roomRepository.find.bind(repositories.roomRepository)

  repositories.messageRepository.create = async (fields = {}) => {
    return await originalMessageCreate({
      kind: 'text',
      sended: false,
      ...(fields ?? {}),
    })
  }

  repositories.messageRepository.find = async (params = {}) => {
    return (await originalMessageFind(params)).map((message: any) =>
      serializeRelations(message, ['contact', 'licensee', 'room', 'trigger', 'cart', 'department']),
    )
  }

  repositories.messageRepository.findFirst = async (params = {}, relations = []) => {
    const message = (await originalMessageFind(params))[0] ?? null

    if (!message) {
      return null
    }

    if (!relations || relations.length === 0) {
      return serializeRelations(message, ['contact', 'licensee', 'room', 'trigger', 'cart', 'department'])
    }

    const [populatedMessage] = await repositories.messageRepository.populateRecords([message], relations)
    return populatedMessage
  }

  repositories.roomRepository.find = async (params = {}) => {
    return (await originalRoomFind(params)).map((room: any) => serializeRelations(room, ['contact']))
  }

  repositories.roomRepository.findFirst = async (params = {}, relations = ['contact']) => {
    const room = (await originalRoomFind(params))[0] ?? null

    if (!room) {
      return null
    }

    if (!relations || relations.length === 0) {
      return serializeRelations(room, ['contact'])
    }

    const [populatedRoom] = await repositories.roomRepository.populateRecords([room], relations)
    return populatedRoom
  }

  repositories.bodyRepository.modelClass = Body
  repositories.contactRepository.modelClass = Contact
  repositories.licenseeRepository.modelClass = Licensee
  repositories.messageRepository.modelClass = Message
  repositories.roomRepository.modelClass = Room
  repositories.templateRepository.modelClass = Template
  repositories.triggerRepository.modelClass = Trigger
  repositories.userRepository.modelClass = User
  repositories.whatsappSessionRepository.modelClass = WhatsappSession
  repositories.departmentRepository.modelClass = Department

  repositories.bodyRepository.relationLoaders = {
    licensee: loadRelation(repositories.licenseeRepository),
  }
  repositories.contactRepository.relationLoaders = {
    licensee: loadRelation(repositories.licenseeRepository),
  }
  repositories.messageRepository.relationLoaders = {
    contact: loadRelation(repositories.contactRepository),
    licensee: loadRelation(repositories.licenseeRepository),
    room: loadRelation(repositories.roomRepository),
    trigger: loadRelation(repositories.triggerRepository),
    department: loadRelation(repositories.departmentRepository),
  }
  repositories.roomRepository.relationLoaders = {
    contact: loadRelation(repositories.contactRepository),
  }
  repositories.templateRepository.relationLoaders = {
    licensee: loadRelation(repositories.licenseeRepository),
  }
  repositories.triggerRepository.relationLoaders = {
    licensee: loadRelation(repositories.licenseeRepository),
  }
  repositories.userRepository.relationLoaders = {
    licensee: loadRelation(repositories.licenseeRepository),
  }
  repositories.whatsappSessionRepository.relationLoaders = {
    licensee: loadRelation(repositories.licenseeRepository),
  }
  repositories.departmentRepository.relationLoaders = {
    licensee: loadRelation(repositories.licenseeRepository),
  }

  bindRepositoryPrototype(BodyRepositoryDatabase.prototype, repositories.bodyRepository, restores)
  bindRepositoryPrototype(ContactRepositoryDatabase.prototype, repositories.contactRepository, restores)
  bindRepositoryPrototype(LicenseeRepositoryDatabase.prototype, repositories.licenseeRepository, restores)
  bindRepositoryPrototype(MessageRepositoryDatabase.prototype, repositories.messageRepository, restores)
  bindRepositoryPrototype(RoomRepositoryDatabase.prototype, repositories.roomRepository, restores)
  bindRepositoryPrototype(TemplateRepositoryDatabase.prototype, repositories.templateRepository, restores)
  bindRepositoryPrototype(TriggerRepositoryDatabase.prototype, repositories.triggerRepository, restores)
  bindRepositoryPrototype(UserRepositoryDatabase.prototype, repositories.userRepository, restores)
  bindRepositoryPrototype(WhatsappSessionRepositoryDatabase.prototype, repositories.whatsappSessionRepository, restores)
  bindRepositoryPrototype(DepartmentRepositoryDatabase.prototype, repositories.departmentRepository, restores)

  patchMember(
    BodyRepositoryDatabase.prototype,
    'model',
    () => createMemoryModelAdapter(repositories.bodyRepository),
    restores,
  )
  patchMember(
    ContactRepositoryDatabase.prototype,
    'model',
    () => createMemoryModelAdapter(repositories.contactRepository),
    restores,
  )
  patchMember(
    LicenseeRepositoryDatabase.prototype,
    'model',
    () => createMemoryModelAdapter(repositories.licenseeRepository),
    restores,
  )
  patchMember(
    MessageRepositoryDatabase.prototype,
    'model',
    () => createMemoryModelAdapter(repositories.messageRepository, { aggregate: aggregateMessageCounts }),
    restores,
  )
  patchMember(
    RoomRepositoryDatabase.prototype,
    'model',
    () => createMemoryModelAdapter(repositories.roomRepository),
    restores,
  )
  patchMember(
    TemplateRepositoryDatabase.prototype,
    'model',
    () => createMemoryModelAdapter(repositories.templateRepository),
    restores,
  )
  patchMember(
    TriggerRepositoryDatabase.prototype,
    'model',
    () => createMemoryModelAdapter(repositories.triggerRepository),
    restores,
  )
  patchMember(
    UserRepositoryDatabase.prototype,
    'model',
    () => createMemoryModelAdapter(repositories.userRepository),
    restores,
  )
  patchMember(
    WhatsappSessionRepositoryDatabase.prototype,
    'model',
    () => createMemoryModelAdapter(repositories.whatsappSessionRepository),
    restores,
  )
  patchMember(
    DepartmentRepositoryDatabase.prototype,
    'model',
    () => createMemoryModelAdapter(repositories.departmentRepository),
    restores,
  )

  bindModelToRepository(Body, repositories.bodyRepository, restores)
  bindModelToRepository(Contact, repositories.contactRepository, restores)
  bindModelToRepository(Licensee, repositories.licenseeRepository, restores)
  bindModelToRepository(Message, repositories.messageRepository, restores)
  bindModelToRepository(Room, repositories.roomRepository, restores)
  bindModelToRepository(Template, repositories.templateRepository, restores)
  bindModelToRepository(Trigger, repositories.triggerRepository, restores)
  bindModelToRepository(User, repositories.userRepository, restores)
  bindModelToRepository(WhatsappSession, repositories.whatsappSessionRepository, restores)
  bindModelToRepository(Department, repositories.departmentRepository, restores)

  patchMember(
    Room,
    'findById',
    async (id: any) =>
      serializeRelations(await repositories.roomRepository.findFirst({ _id: id?._id ?? id }, []), ['contact']),
    restores,
  )
  patchMember(
    Room,
    'findOne',
    async (params = {}) => serializeRelations(await repositories.roomRepository.findFirst(params, []), ['contact']),
    restores,
  )

  activeRestore = () => {
    while (restores.length > 0) {
      const restore = restores.pop()
      restore()
    }
  }

  return { repositories, restore: activeRestore }
}

function resetMemoryRepositories() {
  if (activeRestore) {
    activeRestore()
    activeRestore = null
  }
}

export { createMemoryRepositories, installMemoryRepositories, resetMemoryRepositories }
