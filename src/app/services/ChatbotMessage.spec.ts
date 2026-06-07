import { transformChatbotBody } from './ChatbotMessage'
import Body from '@models/Body'
import { Landbot } from '../plugins/chatbots/Landbot'
import { installMemoryRepositories, resetMemoryRepositories } from '@repositories/testing'
import { licensee as licenseeFactory } from '@factories/licensee'
import { body as bodyFactory } from '@factories/body'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { createRuntimeDependencies } from '../runtime/dependencies'

let dependencies

describe('transformChatbotBody', () => {
  let licensee

  beforeEach(async () => {
    installMemoryRepositories()
    dependencies = createRuntimeDependencies()
    jest.clearAllMocks()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(
      licenseeFactory.build({
        chatbotDefault: 'landbot',
        whatsappDefault: 'dialog',
        whatsappUrl: 'https://waba.360dialog.io/',
        whatsappToken: 'token',
      }),
    )
  })

  afterEach(() => {
    resetMemoryRepositories()
  })

  it('responds with action to send message to messenger and delete body', async () => {
    const chatbotPluginResponseToMessages = jest
      .spyOn(Landbot.prototype, 'responseToMessages')
      .mockImplementation(() => {
        return [
          { _id: 'KSDF656DSD91NSE', contact: { _id: 'id-contact-1' } },
          { _id: 'OAR8Q54LDN02T', contact: { _id: 'id-contact-2' } },
        ]
      })

    const body = await Body.create(
      bodyFactory.build({
        licensee: licensee,
        concluded: false,
      }),
    )

    const data = {
      bodyId: body._id,
    }

    const actions = await transformChatbotBody(data, dependencies)

    expect(chatbotPluginResponseToMessages).toHaveBeenCalledWith(body.content)

    const bodyUpdated = await Body.findById(body._id)
    expect(bodyUpdated.concluded).toEqual(true)

    expect(actions[0].action).toEqual('send-message-to-messenger')
    expect(actions[0].body).toEqual({
      messageId: 'KSDF656DSD91NSE',
      licenseeId: licensee._id,
      contactId: 'id-contact-1',
      url: 'https://waba.360dialog.io/',
      token: 'token',
    })

    expect(actions[1].action).toEqual('send-message-to-messenger')
    expect(actions[1].body).toEqual({
      messageId: 'OAR8Q54LDN02T',
      licenseeId: licensee._id,
      contactId: 'id-contact-2',
      url: 'https://waba.360dialog.io/',
      token: 'token',
    })

    expect(actions.length).toEqual(2)
  })

  it('responds with blank actions if body is invalid and update body', async () => {
    const chatbotPluginResponseToMessages = jest
      .spyOn(Landbot.prototype, 'responseToMessages')
      .mockImplementation(() => {
        return []
      })

    const body = await Body.create(
      bodyFactory.build({
        content: {
          is: 'invalid',
        },
        licensee: licensee,
        concluded: false,
      }),
    )

    const data = {
      bodyId: body._id,
    }

    const actions = await transformChatbotBody(data, dependencies)

    expect(chatbotPluginResponseToMessages).toHaveBeenCalledWith(body.content)

    const bodyUpdated = await Body.findById(body._id)
    expect(bodyUpdated.concluded).toEqual(true)

    expect(actions.length).toEqual(0)
  })
})
