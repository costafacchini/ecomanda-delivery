import { BackgroundjobRepositoryDatabase } from '../repositories/backgroundjob.js'
import { BodyRepositoryDatabase } from '../repositories/body.js'
import { CartRepositoryDatabase } from '../repositories/cart.js'
import { ContactRepositoryDatabase } from '../repositories/contact.js'
import { IntegrationlogRepositoryDatabase } from '../repositories/integrationlog.js'
import { LicenseeRepositoryDatabase } from '../repositories/licensee.js'
import { MessageRepositoryDatabase } from '../repositories/message.js'
import { OrderRepositoryDatabase } from '../repositories/order.js'
import { ProductRepositoryDatabase } from '../repositories/product.js'
import { RoomRepositoryDatabase } from '../repositories/room.js'
import { TemplateRepositoryDatabase } from '../repositories/template.js'
import { TrafficlightRepositoryDatabase } from '../repositories/trafficlight.js'
import { TriggerRepositoryDatabase } from '../repositories/trigger.js'
import { UserRepositoryDatabase } from '../repositories/user.js'
import { parseText as parseTextHelper, parseCart as parseCartHelper } from '../helpers/ParseTriggerText.js'
import { createCartPlugin as createCartPluginFactory } from '../plugins/carts/factory.js'
import { createChatPlugin as createChatPluginFactory } from '../plugins/chats/factory.js'
import { createChatbotPlugin as createChatbotPluginFactory } from '../plugins/chatbots/factory.js'
import { createMessengerPlugin as createMessengerPluginFactory } from '../plugins/messengers/factory.js'
import { createIntegrator as createIntegratorFactory } from '../plugins/integrations/factory.js'
import { Pedidos10 } from '../plugins/integrations/Pedidos10.js'
import { Order } from '../plugins/integrations/Pedidos10/Order.js'
import { Parser as Pedidos10Parser } from '../plugins/integrations/Pedidos10/Parser.js'
import { Auth } from '../plugins/integrations/Pedidos10/services/Auth.js'
import { OrderStatus } from '../plugins/integrations/Pedidos10/services/OrderStatus.js'
import { Webhook } from '../plugins/integrations/Pedidos10/services/Webhook.js'
import { PagarMe } from '../plugins/payments/PagarMe.js'
import { Card } from '../plugins/payments/PagarMe/Card.js'
import { Customer } from '../plugins/payments/PagarMe/Customer.js'
import { Parser as PagarMeParser } from '../plugins/payments/PagarMe/Parser.js'
import { Payment } from '../plugins/payments/PagarMe/Payment.js'
import { Recipient } from '../plugins/payments/PagarMe/Recipient.js'
import { FacebookCatalogImporter } from '../plugins/importers/facebook_catalog/index.js'
import { TemplatesImporter } from '../plugins/importers/template/index.js'

// Builds the full runtime dependency graph from caller-supplied repositories.
// All repository arguments are required at call time; undefined repos will cause runtime errors
// when the corresponding factory functions are first invoked. Use createRuntimeDependencies()
// for production wiring — it supplies concrete Database instances for every repo.
function buildRuntimeDependencies({
  backgroundjobRepository,
  bodyRepository,
  cartRepository,
  contactRepository,
  integrationlogRepository,
  licenseeRepository,
  messageRepository,
  orderRepository,
  productRepository,
  roomRepository,
  templateRepository,
  trafficlightRepository,
  triggerRepository,
  userRepository,
} = {}) {
  const parseText = (text, contact) => parseTextHelper(text, contact, { cartRepository })
  const parseCart = (cartId) => parseCartHelper(cartId, { cartRepository })
  const createCartPlugin = (licensee) => createCartPluginFactory(licensee, { cartRepository })
  const createChatPlugin = (licensee) =>
    createChatPluginFactory(licensee, {
      contactRepository,
      messageRepository,
      roomRepository,
      triggerRepository,
    })
  const createChatbotPlugin = (licensee) =>
    createChatbotPluginFactory(licensee, {
      contactRepository,
      messageRepository,
      roomRepository,
      triggerRepository,
      createCartPlugin,
    })
  const createMessengerPlugin = (licensee) =>
    createMessengerPluginFactory(licensee, {
      contactRepository,
      cartRepository,
      messageRepository,
      triggerRepository,
      productRepository,
      templateRepository,
      parseText,
      createCartPlugin,
    })
  const createPagarMe = (licensee) =>
    new PagarMe(licensee, {
      recipient: new Recipient({ integrationlogRepository, licenseeRepository }),
      customer: new Customer({ integrationlogRepository, contactRepository }),
      payment: new Payment({
        integrationlogRepository,
        licenseeRepository,
        contactRepository,
        cartRepository,
      }),
      parser: new PagarMeParser(),
      card: new Card({ integrationlogRepository, contactRepository }),
    })
  const createPedidos10 = (licensee) =>
    new Pedidos10(licensee, {
      orderModule: new Order(licensee, {
        orderRepository,
        licenseeRepository,
        parser: new Pedidos10Parser(),
        authService: new Auth(licensee, { integrationlogRepository, licenseeRepository }),
        webhookService: new Webhook(licensee, { integrationlogRepository }),
        orderStatusService: new OrderStatus(licensee, { integrationlogRepository }),
      }),
    })
  const createFacebookCatalogImporter = (triggerId) =>
    new FacebookCatalogImporter(triggerId, { triggerRepository, productRepository })
  const createTemplatesImporter = (licenseeId) =>
    new TemplatesImporter(licenseeId, {
      licenseeRepository,
      templateRepository,
      createMessengerPlugin,
    })

  return {
    backgroundjobRepository,
    bodyRepository,
    cartRepository,
    contactRepository,
    integrationlogRepository,
    licenseeRepository,
    messageRepository,
    orderRepository,
    productRepository,
    roomRepository,
    templateRepository,
    trafficlightRepository,
    triggerRepository,
    userRepository,
    parseText,
    parseCart,
    createCartPlugin,
    createChatPlugin,
    createChatbotPlugin,
    createMessengerPlugin,
    createPagarMe,
    createPedidos10,
    createFacebookCatalogImporter,
    createTemplatesImporter,
    createIntegrator: createIntegratorFactory,
  }
}

function createRuntimeDependencies(overrides = {}) {
  const cartRepository = overrides.cartRepository ?? new CartRepositoryDatabase()
  const triggerRepository = overrides.triggerRepository ?? new TriggerRepositoryDatabase()
  const parseText = overrides.parseText ?? ((text, contact) => parseTextHelper(text, contact, { cartRepository }))
  const messageRepository = overrides.messageRepository ?? new MessageRepositoryDatabase({ parseText })
  const contactRepository = overrides.contactRepository ?? new ContactRepositoryDatabase({ messageRepository })

  return buildRuntimeDependencies({
    backgroundjobRepository: overrides.backgroundjobRepository ?? new BackgroundjobRepositoryDatabase(),
    bodyRepository: overrides.bodyRepository ?? new BodyRepositoryDatabase(),
    cartRepository,
    contactRepository,
    integrationlogRepository: overrides.integrationlogRepository ?? new IntegrationlogRepositoryDatabase(),
    licenseeRepository: overrides.licenseeRepository ?? new LicenseeRepositoryDatabase(),
    messageRepository,
    orderRepository: overrides.orderRepository ?? new OrderRepositoryDatabase(),
    productRepository: overrides.productRepository ?? new ProductRepositoryDatabase(),
    roomRepository: overrides.roomRepository ?? new RoomRepositoryDatabase(),
    templateRepository: overrides.templateRepository ?? new TemplateRepositoryDatabase(),
    trafficlightRepository: overrides.trafficlightRepository ?? new TrafficlightRepositoryDatabase(),
    triggerRepository,
    userRepository: overrides.userRepository ?? new UserRepositoryDatabase(),
  })
}

export { buildRuntimeDependencies, createRuntimeDependencies }
