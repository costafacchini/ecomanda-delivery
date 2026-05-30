import { WhatsappSessionRepositoryDatabase } from '../repositories/whatsappsession'
import { BackgroundjobRepositoryDatabase } from '../repositories/backgroundjob'
import { BodyRepositoryDatabase } from '../repositories/body'
import { CartRepositoryDatabase } from '../repositories/cart'
import { ContactRepositoryDatabase } from '../repositories/contact'
import { IntegrationlogRepositoryDatabase } from '../repositories/integrationlog'
import { LicenseeRepositoryDatabase } from '../repositories/licensee'
import { MessageRepositoryDatabase } from '../repositories/message'
import { OrderRepositoryDatabase } from '../repositories/order'
import { ProductRepositoryDatabase } from '../repositories/product'
import { RoomRepositoryDatabase } from '../repositories/room'
import { TemplateRepositoryDatabase } from '../repositories/template'
import { TrafficlightRepositoryDatabase } from '../repositories/trafficlight'
import { TriggerRepositoryDatabase } from '../repositories/trigger'
import { UserRepositoryDatabase } from '../repositories/user'
import { parseText as parseTextHelper, parseCart as parseCartHelper } from '../helpers/ParseTriggerText'
import { createCartPlugin as createCartPluginFactory } from '../plugins/carts/factory'
import { createChatPlugin as createChatPluginFactory } from '../plugins/chats/factory'
import { createChatbotPlugin as createChatbotPluginFactory } from '../plugins/chatbots/factory'
import { createMessengerPlugin as createMessengerPluginFactory } from '../plugins/messengers/factory'
import { createIntegrator as createIntegratorFactory } from '../plugins/integrations/factory'
import { Pedidos10 } from '../plugins/integrations/Pedidos10'
import { Order } from '../plugins/integrations/Pedidos10/Order'
import { Parser as Pedidos10Parser } from '../plugins/integrations/Pedidos10/Parser'
import { Auth } from '../plugins/integrations/Pedidos10/services/Auth'
import { OrderStatus } from '../plugins/integrations/Pedidos10/services/OrderStatus'
import { Webhook } from '../plugins/integrations/Pedidos10/services/Webhook'
import { PagarMe } from '../plugins/payments/PagarMe'
import { Card } from '../plugins/payments/PagarMe/Card'
import { Customer } from '../plugins/payments/PagarMe/Customer'
import { Parser as PagarMeParser } from '../plugins/payments/PagarMe/Parser'
import { Payment } from '../plugins/payments/PagarMe/Payment'
import { Recipient } from '../plugins/payments/PagarMe/Recipient'
import { FacebookCatalogImporter } from '../plugins/importers/facebook_catalog/index'
import { TemplatesImporter } from '../plugins/importers/template/index'

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
  whatsappSessionRepository,
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
      whatsappSessionRepository,
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
    whatsappSessionRepository,
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
    whatsappSessionRepository: overrides.whatsappSessionRepository ?? new WhatsappSessionRepositoryDatabase(),
  })
}

export { buildRuntimeDependencies, createRuntimeDependencies }
