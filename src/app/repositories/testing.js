import Body from '../models/Body.js'
import Backgroundjob from '../models/Backgroundjob.js'
import Cart from '../models/Cart.js'
import Integrationlog from '../models/Integrationlog.js'
import Licensee from '../models/Licensee.js'
import Product from '../models/Product.js'
import Room from '../models/Room.js'
import Template from '../models/Template.js'
import Trigger from '../models/Trigger.js'
import { BackgroundjobRepositoryDatabase, BackgroundjobRepositoryMemory } from './backgroundjob.js'
import { BodyRepositoryDatabase, BodyRepositoryMemory } from './body.js'
import { CartRepositoryDatabase, CartRepositoryMemory } from './cart.js'
import { ContactRepositoryDatabase, ContactRepositoryMemory } from './contact.js'
import { IntegrationlogRepositoryDatabase, IntegrationlogRepositoryMemory } from './integrationlog.js'
import { LicenseeRepositoryDatabase, LicenseeRepositoryMemory } from './licensee.js'
import { MessageRepositoryDatabase, MessageRepositoryMemory } from './message.js'
import { OrderRepositoryDatabase, OrderRepositoryMemory } from './order.js'
import { ProductRepositoryDatabase, ProductRepositoryMemory } from './product.js'
import { RoomRepositoryDatabase, RoomRepositoryMemory } from './room.js'
import { TemplateRepositoryDatabase, TemplateRepositoryMemory } from './template.js'
import { TrafficlightRepositoryMemory } from './trafficlight.js'
import { TriggerRepositoryDatabase, TriggerRepositoryMemory } from './trigger.js'
import { UserRepositoryDatabase, UserRepositoryMemory } from './user.js'

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
  }

  const triggerRepository = new TriggerRepositoryMemory(state.triggers)
  const messageRepository = new MessageRepositoryMemory({
    items: state.messages,
    triggerRepository,
  })
  const contactRepository = new ContactRepositoryMemory({
    items: state.contacts,
    messageRepository,
  })

  return {
    state,
    backgroundjobRepository: new BackgroundjobRepositoryMemory(state.backgroundjobs),
    bodyRepository: new BodyRepositoryMemory(state.bodies),
    cartRepository: new CartRepositoryMemory(state.carts),
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
  }
}

function bindModelToRepository(model, repository, restores) {
  patchMember(model, 'create', async (fields = {}) => await repository.create(fields), restores)
  patchMember(model, 'findById', async (id) => await repository.findFirst({ _id: id?._id ?? id }), restores)
  patchMember(model, 'findOne', async (params = {}) => await repository.findFirst(params), restores)
  patchMember(model, 'deleteMany', async (params = {}) => await repository.delete(params), restores)
  patchMember(
    model,
    'where',
    (params = {}) => ({
      countDocuments: async () => (await repository.find(params)).length,
    }),
    restores,
  )
}

function bindRepositoryPrototype(prototype, repository, restores) {
  const methods = [
    'findFirst',
    'create',
    'update',
    'updateMany',
    'find',
    'delete',
    'save',
    'contactWithWhatsappWindowClosed',
    'getContactByNumber',
    'createInteractiveMessages',
    'createTextMessageInsteadInteractive',
    'createMessageToWarnAboutWindowOfWhatsassHasExpired',
    'createMessageToWarnAboutWindowOfWhatsassIsEnding',
  ]

  methods.forEach((method) => {
    if (typeof repository[method] === 'function') {
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

    return attachCartMethods(cart)
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

    return message
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

    return room
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

  bindModelToRepository(Backgroundjob, repositories.backgroundjobRepository, restores)
  bindModelToRepository(Body, repositories.bodyRepository, restores)
  bindModelToRepository(Integrationlog, repositories.integrationlogRepository, restores)
  bindModelToRepository(Licensee, repositories.licenseeRepository, restores)
  bindModelToRepository(Product, repositories.productRepository, restores)
  bindModelToRepository(Room, repositories.roomRepository, restores)
  bindModelToRepository(Template, repositories.templateRepository, restores)
  bindModelToRepository(Trigger, repositories.triggerRepository, restores)

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
