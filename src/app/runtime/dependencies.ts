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
import { createChatPlugin as createChatPluginFactory } from '../plugins/chats/factory'
import { createChatbotPlugin as createChatbotPluginFactory } from '../plugins/chatbots/factory'
import { createMessengerPlugin as createMessengerPluginFactory } from '../plugins/messengers/factory'
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
    })
  const createMessengerPlugin = (licensee: any) =>
    createMessengerPluginFactory(licensee, {
      contactRepository,
      messageRepository,
      triggerRepository,
      templateRepository,
      parseText,
      whatsappSessionRepository,
    })
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
    createChatPlugin,
    createChatbotPlugin,
    createMessengerPlugin,
    createTemplatesImporter,
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
