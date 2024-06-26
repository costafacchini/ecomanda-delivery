const transformChatbotTransferBody = require('./ChatbotTransfer')
const Body = require('@models/Body')
const Landbot = require('../plugins/chatbots/Landbot')
const mongoServer = require('.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { body: bodyFactory } = require('@factories/body')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')

describe('transformChatbotTransferBody', () => {
  let licensee

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(
      licenseeFactory.build({
        chatbotDefault: 'landbot',
        chatUrl: 'https://chat.url',
      }),
    )
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('responds with action to transfer message to chat and delete body', async () => {
    const chatbotPluginResponseToMessages = jest
      .spyOn(Landbot.prototype, 'responseTransferToMessage')
      .mockImplementation(() => {
        return { _id: 'KSDF656DSD91NSE' }
      })

    const body = await Body.create(
      bodyFactory.build({
        licensee: licensee,
      }),
    )

    const data = {
      bodyId: body._id,
    }

    const actions = await transformChatbotTransferBody(data)

    expect(chatbotPluginResponseToMessages).toHaveBeenCalledWith(body.content)

    const bodyDeleted = await Body.findById(body._id)
    expect(bodyDeleted).toEqual(null)

    expect(actions[0].action).toEqual('transfer-to-chat')
    expect(actions[0].body).toEqual({ messageId: 'KSDF656DSD91NSE', url: 'https://chat.url' })

    expect(actions.length).toEqual(1)
  })

  it('responds with blank actions if body is invalid and delete body', async () => {
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
      }),
    )

    const data = {
      bodyId: body._id,
    }

    const actions = await transformChatbotTransferBody(data)

    expect(chatbotPluginResponseToMessages).toHaveBeenCalledWith(body.content)

    const bodyDeleted = await Body.findById(body._id)
    expect(bodyDeleted).toEqual(null)

    expect(actions.length).toEqual(0)
  })
})
