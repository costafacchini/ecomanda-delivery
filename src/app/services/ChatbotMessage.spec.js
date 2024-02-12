const transformChatbotBody = require('./ChatbotMessage')
const Body = require('@models/Body')
const Landbot = require('../plugins/chatbots/Landbot')
const mongoServer = require('.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { body: bodyFactory } = require('@factories/body')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')

describe('transformChatbotBody', () => {
  let licensee

  beforeEach(async () => {
    await mongoServer.connect()
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

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('responds with action to send message to messenger and delete body', async () => {
    const chatbotPluginResponseToMessages = jest
      .spyOn(Landbot.prototype, 'responseToMessages')
      .mockImplementation(() => {
        return [{ _id: 'KSDF656DSD91NSE' }, { _id: 'OAR8Q54LDN02T' }]
      })

    const body = await Body.create(
      bodyFactory.build({
        licensee: licensee,
      }),
    )

    const data = {
      bodyId: body._id,
    }

    const actions = await transformChatbotBody(data)

    expect(chatbotPluginResponseToMessages).toHaveBeenCalledWith(body.content)

    const bodyDeleted = await Body.findById(body._id)
    expect(bodyDeleted).toEqual(null)

    expect(actions[0].action).toEqual('send-message-to-messenger')
    expect(actions[0].body).toEqual({ messageId: 'KSDF656DSD91NSE', url: 'https://waba.360dialog.io/', token: 'token' })

    expect(actions[1].action).toEqual('send-message-to-messenger')
    expect(actions[1].body).toEqual({ messageId: 'OAR8Q54LDN02T', url: 'https://waba.360dialog.io/', token: 'token' })

    expect(actions.length).toEqual(2)
  })

  it('responds with blank actions if body is invalid and delete body', async () => {
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
      }),
    )

    const data = {
      bodyId: body._id,
    }

    const actions = await transformChatbotBody(data)

    expect(chatbotPluginResponseToMessages).toHaveBeenCalledWith(body.content)

    const bodyDeleted = await Body.findById(body._id)
    expect(bodyDeleted).toEqual(null)

    expect(actions.length).toEqual(0)
  })
})
