import { transformChatbotTransferBody } from './ChatbotTransfer'
import Body from '@models/Body'
import { Landbot } from '../plugins/chatbots/Landbot'
import { installMemoryRepositories, resetMemoryRepositories } from '@repositories/testing'
import { licensee as licenseeFactory } from '@factories/licensee'
import { body as bodyFactory } from '@factories/body'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'
import { createRuntimeDependencies } from '../runtime/dependencies'

let dependencies

describe('transformChatbotTransferBody', () => {
  let licensee

  beforeEach(async () => {
    installMemoryRepositories()
    dependencies = createRuntimeDependencies()
    jest.clearAllMocks()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(
      licenseeFactory.build({
        chatbotDefault: 'landbot',
        chatUrl: 'https://chat.url',
      }),
    )
  })

  afterEach(() => {
    resetMemoryRepositories()
  })

  it('responds with action to transfer message to chat and delete body', async () => {
    const chatbotPluginResponseToMessages = jest
      .spyOn(Landbot.prototype, 'responseTransferToMessage')
      .mockImplementation(() => {
        return { _id: 'KSDF656DSD91NSE', contact: { _id: 'id-contact-1' } }
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

    const actions = await transformChatbotTransferBody(data, dependencies)

    expect(chatbotPluginResponseToMessages).toHaveBeenCalledWith(body.content)

    const bodyUpdated = await Body.findById(body._id)
    expect(bodyUpdated.concluded).toEqual(true)

    expect(actions[0].action).toEqual('transfer-to-chat')
    expect(actions[0].body).toEqual({
      messageId: 'KSDF656DSD91NSE',
      licenseeId: licensee._id,
      contactId: 'id-contact-1',
      url: 'https://chat.url',
    })

    expect(actions.length).toEqual(1)
  })

  it('responds with blank actions if body is invalid and update body', async () => {
    const chatbotPluginResponseToMessages = jest
      .spyOn(Landbot.prototype, 'responseTransferToMessage')
      .mockImplementation(() => {
        return null
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

    const actions = await transformChatbotTransferBody(data, dependencies)

    expect(chatbotPluginResponseToMessages).toHaveBeenCalledWith(body.content)

    const bodyUpdated = await Body.findById(body._id)
    expect(bodyUpdated.concluded).toEqual(true)

    expect(actions.length).toEqual(0)
  })
})
