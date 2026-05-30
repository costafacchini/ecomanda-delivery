import Body from '../models/Body'
import Backgroundjob from '../models/Backgroundjob'
import Cart from '../models/Cart'
import Contact from '../models/Contact'
import Integrationlog from '../models/Integrationlog'
import Licensee from '../models/Licensee'
import Message from '../models/Message'
import Order from '../models/Order'
import Product from '../models/Product'
import Room from '../models/Room'
import Template from '../models/Template'
import Trigger from '../models/Trigger'
import User from '../models/User'
import { BackgroundjobRepositoryDatabase, BackgroundjobRepositoryMemory } from './backgroundjob'
import { BodyRepositoryDatabase, BodyRepositoryMemory } from './body'
import { CartRepositoryDatabase, CartRepositoryMemory } from './cart'
import { ContactRepositoryDatabase, ContactRepositoryMemory } from './contact'
import { IntegrationlogRepositoryDatabase, IntegrationlogRepositoryMemory } from './integrationlog'
import { LicenseeRepositoryDatabase, LicenseeRepositoryMemory } from './licensee'
import { MessageRepositoryDatabase, MessageRepositoryMemory } from './message'
import { OrderRepositoryDatabase, OrderRepositoryMemory } from './order'
import { ProductRepositoryDatabase, ProductRepositoryMemory } from './product'
import { RoomRepositoryDatabase, RoomRepositoryMemory } from './room'
import { TemplateRepositoryDatabase, TemplateRepositoryMemory } from './template'
import { TrafficlightRepositoryMemory } from './trafficlight'
import { TriggerRepositoryDatabase, TriggerRepositoryMemory } from './trigger'
import { UserRepositoryDatabase, UserRepositoryMemory } from './user'
import WhatsappSession from '../models/WhatsappSession'
import { WhatsappSessionRepositoryDatabase, WhatsappSessionRepositoryMemory } from './whatsappsession'
import { RepositoryMemory, matchesFilter, sortRecords, comparableValue } from './repository'
import { parseText as parseTextHelper } from '../helpers/ParseTriggerText'

let activeRestore = null

function serializeRelations(record, relations = []) {
  if (!record) {
    return record
  }

  const clone = { ...record }

  relations.forEach((relation) => {
    if (clone[relation] && typeof clone[relation] === 'object') {
      clone[relation] = clone[relation]._id ?? clone[relation]
    }
  })

  return clone
}

function attachCartMethods(cart) {
  if (!cart) {
    return cart
  }

  if (typeof cart.calculateTotal !== 'function') {
    cart.calculateTotal = Cart.prototype.calculateTotal
  }

  if (typeof cart.calculateTotalItem !== 'function') {
    cart.calculateTotalItem = Cart.prototype.calculateTotalItem
  }

  return cart
}

function serializeCart(cart, relations = []) {
  if (!cart) {
    return cart
  }

  const clone = { ...cart }

  if (!relations.includes('contact') && clone.contact && typeof clone.contact === 'object') {
    clone.contact = clone.contact._id ?? clone.contact
  }

  if (!relations.includes('licensee') && clone.licensee && typeof clone.licensee === 'object') {
    clone.licensee = clone.licensee._id ?? clone.licensee
  }

  if (Array.isArray(clone.products)) {
    clone.products = clone.products.map((product) => {
      const productClone = { ...product }

      if (!relations.includes('products.product') && productClone.product && typeof productClone.product === 'object') {
        productClone.product = productClone.product._id ?? productClone.product
      }

      return productClone
    })
  }

  return clone
}

function createMemoryRepositories() {
  const state = {
    backgroundjobs: [],
    bodies: [],
    carts: [],
    contacts: [],
    integrationlogs: [],
    licensees: [],
    messages: [],
    orders: [],
    products: [],
    rooms: [],
    templates: [],
    trafficlights: [],
    triggers: [],
    users: [],
    whatsappSessions: [],
  }

  const cartRepository = new CartRepositoryMemory(state.carts)
  const triggerRepository = new TriggerRepositoryMemory(state.triggers)
  const parseText = (text, contact) => parseTextHelper(text, contact, { cartRepository })
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
    backgroundjobRepository: new BackgroundjobRepositoryMemory(state.backgroundjobs),
    bodyRepository: new BodyRepositoryMemory(state.bodies),
    cartRepository,
    contactRepository,
    integrationlogRepository: new IntegrationlogRepositoryMemory(state.integrationlogs),
    licenseeRepository: new LicenseeRepositoryMemory(state.licensees),
    messageRepository,
    orderRepository: new OrderRepositoryMemory(state.orders),
    productRepository: new ProductRepositoryMemory(state.products),
    roomRepository: new RoomRepositoryMemory(state.rooms),
    templateRepository: new TemplateRepositoryMemory(state.templates),
    trafficlightRepository: new TrafficlightRepositoryMemory(state.trafficlights),
    triggerRepository,
    userRepository: new UserRepositoryMemory(state.users),
    whatsappSessionRepository: new WhatsappSessionRepositoryMemory(state.whatsappSessions),
  }
}

class MemoryQuery {
  constructor(repository, params = {}, { single = false } = {}) {
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

  limit(value) {
    this.limitCount = value
    return this
  }

  where(fieldOrFilter = {}) {
    if (typeof fieldOrFilter === 'string') {
      this.currentField = fieldOrFilter
      return this
    }

    this.predicates.push((record) => matchesFilter(record, fieldOrFilter))
    return this
  }

  equals(value) {
    const field = this.currentField
    this.predicates.push((record) => matchesFilter(record, { [field]: value }))
    return this
  }

  ne(value) {
    const field = this.currentField
    this.predicates.push((record) => matchesFilter(record, { [field]: { $ne: value } }))
    return this
  }

  gt(value) {
    const field = this.currentField
    this.predicates.push((record) => matchesFilter(record, { [field]: { $gt: value } }))
    return this
  }

  gte(value) {
    const field = this.currentField
    this.predicates.push((record) => matchesFilter(record, { [field]: { $gte: value } }))
    return this
  }

  lt(value) {
    const field = this.currentField
    this.predicates.push((record) => matchesFilter(record, { [field]: { $lt: value } }))
    return this
  }

  lte(value) {
    const field = this.currentField
    this.predicates.push((record) => matchesFilter(record, { [field]: { $lte: value } }))
    return this
  }

  or(filters = []) {
    this.predicates.push((record) => filters.some((filter) => matchesFilter(record, filter)))
    return this
  }

  populate(relation) {
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

  then(resolve, reject) {
    return this.exec().then(resolve, reject)
  }

  async resolve() {
    let records = await this.repository.find(this.params)

    records = records.filter((record) => this.predicates.every((predicate) => predicate(record)))

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

function aggregateMessageCounts(repository, pipeline = []) {
  const matchStage = pipeline.find((stage) => stage?.$match)?.$match ?? {}
  const records = repository.items.filter((record) => matchesFilter(record, matchStage))
  const grouped = new Map()

  records.forEach((record) => {
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
    .forEach((entry) => {
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

function createMemoryModelAdapter(repository, { aggregate } = {}) {
  return {
    create: async (fields = {}) => await repository.create(fields),
    find: (params = {}) => new MemoryQuery(repository, params),
    findOne: (params = {}) => new MemoryQuery(repository, params, { single: true }),
    findById: (id) => new MemoryQuery(repository, { _id: id?._id ?? id }, { single: true }),
    deleteMany: async (params = {}) => await repository.delete(params),
    where: (params = {}) => new MemoryQuery(repository).where(params),
    aggregate: async (pipeline = []) => (aggregate ? await aggregate(repository, pipeline) : []),
  }
}

function bindModelToRepository(model, repository, restores) {
  const adapter = createMemoryModelAdapter(repository)

  patchMember(model, 'create', adapter.create, restores)
  patchMember(model, 'find', adapter.find, restores)
  patchMember(model, 'findById', adapter.findById, restores)
  patchMember(model, 'findOne', adapter.findOne, restores)
  patchMember(model, 'deleteMany', adapter.deleteMany, restores)
  patchMember(model, 'where', adapter.where, restores)
}

function bindRepositoryPrototype(prototype, repository, restores) {
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

function patchMember(target, key, replacement, restores) {
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
  const restores = []
  const loadRelation = (repository) => async (value) => {
    const identifier = value?._id ?? value

    if (identifier == null) {
      return value
    }

    return await repository.findFirst({ _id: identifier }, [])
  }
  const originalCartCreate = repositories.cartRepository.create.bind(repositories.cartRepository)
  const originalCartFind = repositories.cartRepository.find.bind(repositories.cartRepository)
  const originalCartSave = repositories.cartRepository.save.bind(repositories.cartRepository)
  const originalMessageCreate = repositories.messageRepository.create.bind(repositories.messageRepository)
  const originalMessageFind = repositories.messageRepository.find.bind(repositories.messageRepository)
  const originalRoomFind = repositories.roomRepository.find.bind(repositories.roomRepository)

  repositories.cartRepository.create = async (fields = {}) => {
    return attachCartMethods(await originalCartCreate(fields))
  }

  repositories.cartRepository.find = async (params = {}) => {
    return (await originalCartFind(params)).map((cart) => attachCartMethods(serializeCart(cart)))
  }

  repositories.cartRepository.findFirst = async (params = {}, relations = []) => {
    const cart = (await originalCartFind(params))[0] ?? null

    if (!cart) {
      return null
    }

    if (!relations || relations.length === 0) {
      return attachCartMethods(serializeCart(cart))
    }

    const [populatedCart] = await repositories.cartRepository.populateRecords([cart], relations)
    return attachCartMethods(populatedCart)
  }

  repositories.cartRepository.save = async (document) => {
    return attachCartMethods(serializeCart(await originalCartSave(document)))
  }

  repositories.messageRepository.create = async (fields = {}) => {
    return await originalMessageCreate({
      kind: 'text',
      sended: false,
      ...(fields ?? {}),
    })
  }

  repositories.messageRepository.find = async (params = {}) => {
    return (await originalMessageFind(params)).map((message) =>
      serializeRelations(message, ['contact', 'licensee', 'room', 'trigger', 'cart']),
    )
  }

  repositories.messageRepository.findFirst = async (params = {}, relations = []) => {
    const message = (await originalMessageFind(params))[0] ?? null

    if (!message) {
      return null
    }

    if (!relations || relations.length === 0) {
      return serializeRelations(message, ['contact', 'licensee', 'room', 'trigger', 'cart'])
    }

    const [populatedMessage] = await repositories.messageRepository.populateRecords([message], relations)
    return populatedMessage
  }

  repositories.roomRepository.find = async (params = {}) => {
    return (await originalRoomFind(params)).map((room) => serializeRelations(room, ['contact']))
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

  repositories.backgroundjobRepository.modelClass = Backgroundjob
  repositories.bodyRepository.modelClass = Body
  repositories.cartRepository.modelClass = Cart
  repositories.contactRepository.modelClass = Contact
  repositories.integrationlogRepository.modelClass = Integrationlog
  repositories.licenseeRepository.modelClass = Licensee
  repositories.messageRepository.modelClass = Message
  repositories.orderRepository.modelClass = Order
  repositories.productRepository.modelClass = Product
  repositories.roomRepository.modelClass = Room
  repositories.templateRepository.modelClass = Template
  repositories.triggerRepository.modelClass = Trigger
  repositories.userRepository.modelClass = User
  repositories.whatsappSessionRepository.modelClass = WhatsappSession

  repositories.backgroundjobRepository.relationLoaders = {
    licensee: loadRelation(repositories.licenseeRepository),
    body: loadRelation(repositories.bodyRepository),
  }
  repositories.bodyRepository.relationLoaders = {
    licensee: loadRelation(repositories.licenseeRepository),
  }
  repositories.cartRepository.relationLoaders = {
    contact: loadRelation(repositories.contactRepository),
    licensee: loadRelation(repositories.licenseeRepository),
    'products.product': loadRelation(repositories.productRepository),
  }
  repositories.contactRepository.relationLoaders = {
    licensee: loadRelation(repositories.licenseeRepository),
  }
  repositories.messageRepository.relationLoaders = {
    cart: loadRelation(repositories.cartRepository),
    contact: loadRelation(repositories.contactRepository),
    licensee: loadRelation(repositories.licenseeRepository),
    room: loadRelation(repositories.roomRepository),
    trigger: loadRelation(repositories.triggerRepository),
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

  bindRepositoryPrototype(BackgroundjobRepositoryDatabase.prototype, repositories.backgroundjobRepository, restores)
  bindRepositoryPrototype(BodyRepositoryDatabase.prototype, repositories.bodyRepository, restores)
  bindRepositoryPrototype(CartRepositoryDatabase.prototype, repositories.cartRepository, restores)
  bindRepositoryPrototype(ContactRepositoryDatabase.prototype, repositories.contactRepository, restores)
  bindRepositoryPrototype(IntegrationlogRepositoryDatabase.prototype, repositories.integrationlogRepository, restores)
  bindRepositoryPrototype(LicenseeRepositoryDatabase.prototype, repositories.licenseeRepository, restores)
  bindRepositoryPrototype(MessageRepositoryDatabase.prototype, repositories.messageRepository, restores)
  bindRepositoryPrototype(OrderRepositoryDatabase.prototype, repositories.orderRepository, restores)
  bindRepositoryPrototype(ProductRepositoryDatabase.prototype, repositories.productRepository, restores)
  bindRepositoryPrototype(RoomRepositoryDatabase.prototype, repositories.roomRepository, restores)
  bindRepositoryPrototype(TemplateRepositoryDatabase.prototype, repositories.templateRepository, restores)
  bindRepositoryPrototype(TriggerRepositoryDatabase.prototype, repositories.triggerRepository, restores)
  bindRepositoryPrototype(UserRepositoryDatabase.prototype, repositories.userRepository, restores)
  bindRepositoryPrototype(WhatsappSessionRepositoryDatabase.prototype, repositories.whatsappSessionRepository, restores)

  patchMember(
    BackgroundjobRepositoryDatabase.prototype,
    'model',
    () => createMemoryModelAdapter(repositories.backgroundjobRepository),
    restores,
  )
  patchMember(
    BodyRepositoryDatabase.prototype,
    'model',
    () => createMemoryModelAdapter(repositories.bodyRepository),
    restores,
  )
  patchMember(
    CartRepositoryDatabase.prototype,
    'model',
    () => createMemoryModelAdapter(repositories.cartRepository),
    restores,
  )
  patchMember(
    ContactRepositoryDatabase.prototype,
    'model',
    () => createMemoryModelAdapter(repositories.contactRepository),
    restores,
  )
  patchMember(
    IntegrationlogRepositoryDatabase.prototype,
    'model',
    () => createMemoryModelAdapter(repositories.integrationlogRepository),
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
    OrderRepositoryDatabase.prototype,
    'model',
    () => createMemoryModelAdapter(repositories.orderRepository),
    restores,
  )
  patchMember(
    ProductRepositoryDatabase.prototype,
    'model',
    () => createMemoryModelAdapter(repositories.productRepository),
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

  bindModelToRepository(Backgroundjob, repositories.backgroundjobRepository, restores)
  bindModelToRepository(Body, repositories.bodyRepository, restores)
  bindModelToRepository(Contact, repositories.contactRepository, restores)
  bindModelToRepository(Integrationlog, repositories.integrationlogRepository, restores)
  bindModelToRepository(Licensee, repositories.licenseeRepository, restores)
  bindModelToRepository(Message, repositories.messageRepository, restores)
  bindModelToRepository(Order, repositories.orderRepository, restores)
  bindModelToRepository(Product, repositories.productRepository, restores)
  bindModelToRepository(Room, repositories.roomRepository, restores)
  bindModelToRepository(Template, repositories.templateRepository, restores)
  bindModelToRepository(Trigger, repositories.triggerRepository, restores)
  bindModelToRepository(User, repositories.userRepository, restores)
  bindModelToRepository(WhatsappSession, repositories.whatsappSessionRepository, restores)

  patchMember(
    IntegrationlogRepositoryDatabase.prototype,
    'create',
    async (fields = {}) => await Integrationlog.create(fields),
    restores,
  )
  patchMember(
    Room,
    'findById',
    async (id) =>
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
