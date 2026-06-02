import { WhatsappSessionRepositoryDatabase } from '../repositories/whatsappsession'
import { BodyRepositoryDatabase } from '../repositories/body'
import { ContactRepositoryDatabase } from '../repositories/contact'
import { LicenseeRepositoryDatabase } from '../repositories/licensee'
import { MessageRepositoryDatabase } from '../repositories/message'
import { RoomRepositoryDatabase } from '../repositories/room'
import { TemplateRepositoryDatabase } from '../repositories/template'
import { TrafficlightRepositoryDatabase } from '../repositories/trafficlight'
import { TriggerRepositoryDatabase } from '../repositories/trigger'
import { UserRepositoryDatabase } from '../repositories/user'
import { parseText as parseTextHelper } from '../helpers/ParseTriggerText'
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
  bodyRepository,
  contactRepository,
  licenseeRepository,
  messageRepository,
  roomRepository,
  templateRepository,
  trafficlightRepository,
  triggerRepository,
  userRepository,
  whatsappSessionRepository,
}: Record<string, any> = {}) {
  const parseText = (text: any, contact: any) => parseTextHelper(text, contact, {})
  const createCartPlugin = (licensee: any) => createCartPluginFactory(licensee, {})
  const createChatPlugin = (licensee: any) =>
    createChatPluginFactory(licensee, {
      contactRepository,
      messageRepository,
      roomRepository,
      triggerRepository,
    })
  const createChatbotPlugin = (licensee: any) =>
    createChatbotPluginFactory(licensee, {
      contactRepository,
      messageRepository,
      roomRepository,
      triggerRepository,
      createCartPlugin,
    })
  const createMessengerPlugin = (licensee: any) =>
    createMessengerPluginFactory(licensee, {
      contactRepository,
      messageRepository,
      triggerRepository,
      templateRepository,
      parseText,
      createCartPlugin,
      whatsappSessionRepository,
    })
  const createPagarMe = (licensee: any) =>
    new PagarMe(licensee, {
      recipient: new Recipient({ licenseeRepository }),
      customer: new Customer({ contactRepository }),
      payment: new Payment({
        licenseeRepository,
        contactRepository,
      }),
      parser: new PagarMeParser(),
      card: new Card({ contactRepository }),
    })
  const createPedidos10 = (licensee: any) =>
    new Pedidos10(licensee, {
      orderModule: new Order(licensee, {
        licenseeRepository,
        parser: new Pedidos10Parser(),
        authService: new Auth(licensee, { licenseeRepository }),
        webhookService: new Webhook(licensee, {}),
        orderStatusService: new OrderStatus(licensee, {}),
      }),
    })
  const createFacebookCatalogImporter = (triggerId: any) =>
    new FacebookCatalogImporter(triggerId, { triggerRepository })
  const createTemplatesImporter = (licenseeId: any) =>
    new TemplatesImporter(licenseeId, {
      licenseeRepository,
      templateRepository,
      createMessengerPlugin,
    })

  return {
    bodyRepository,
    contactRepository,
    licenseeRepository,
    messageRepository,
    roomRepository,
    templateRepository,
    trafficlightRepository,
    triggerRepository,
    userRepository,
    whatsappSessionRepository,
    parseText,
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

function createRuntimeDependencies(overrides: Record<string, any> = {}) {
  const triggerRepository = overrides.triggerRepository ?? new TriggerRepositoryDatabase()
  const parseText = overrides.parseText ?? ((text: any, contact: any) => parseTextHelper(text, contact, {}))
  const messageRepository = overrides.messageRepository ?? new MessageRepositoryDatabase({ parseText })
  const contactRepository = overrides.contactRepository ?? new ContactRepositoryDatabase({ messageRepository })

  return buildRuntimeDependencies({
    bodyRepository: overrides.bodyRepository ?? new BodyRepositoryDatabase(),
    contactRepository,
    licenseeRepository: overrides.licenseeRepository ?? new LicenseeRepositoryDatabase(),
    messageRepository,
    roomRepository: overrides.roomRepository ?? new RoomRepositoryDatabase(),
    templateRepository: overrides.templateRepository ?? new TemplateRepositoryDatabase(),
    trafficlightRepository: overrides.trafficlightRepository ?? new TrafficlightRepositoryDatabase(),
    triggerRepository,
    userRepository: overrides.userRepository ?? new UserRepositoryDatabase(),
    whatsappSessionRepository: overrides.whatsappSessionRepository ?? new WhatsappSessionRepositoryDatabase(),
  })
}

export { buildRuntimeDependencies, createRuntimeDependencies }
