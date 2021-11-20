const transformChatBody = require('./ChatMessage')
const Licensee = require('@models/Licensee')
const Body = require('@models/Body')
const Jivochat = require('../plugins/chats/Jivochat')
const mongoServer = require('.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { body: bodyFactory } = require('@factories/body')

describe('transformChatBody', () => {
  let licensee

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()

    licensee = await Licensee.create(
      licenseeFactory.build({
        chatDefault: 'jivochat',
        chatUrl: 'https://www.jivo.chat.com',
        whatsappDefault: 'chatapi',
        whatsappUrl: 'https://chat.url',
        whatsappToken: 'token',
      })
    )
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('responds with action to dispatcher action of plugin and delete body', async () => {
    const chatPluginResponseToMessages = jest.spyOn(Jivochat.prototype, 'responseToMessages').mockImplementation(() => {
      return [{ _id: 'KSDF656DSD91NSE' }, { _id: 'OAR8Q54LDN02T' }]
    })

    const body = await Body.create(
      bodyFactory.build({
        licensee: licensee,
      })
    )

    const data = {
      bodyId: body._id,
    }

    const actions = await transformChatBody(data)

    expect(chatPluginResponseToMessages).toHaveBeenCalledWith(body.content)

    const bodyDeleted = await Body.findById(body._id)
    expect(bodyDeleted).toEqual(null)

    expect(actions[0].action).toEqual('send-message-to-messenger')
    expect(actions[0].body).toEqual({ messageId: 'KSDF656DSD91NSE', url: 'https://chat.url', token: 'token' })

    expect(actions[1].action).toEqual('send-message-to-messenger')
    expect(actions[1].body).toEqual({ messageId: 'OAR8Q54LDN02T', url: 'https://chat.url', token: 'token' })

    expect(actions.length).toEqual(2)
  })

  it('responds with blank actions if body is invalid and delete body', async () => {
    const chatPluginResponseToMessages = jest.spyOn(Jivochat.prototype, 'responseToMessages').mockImplementation(() => {
      return []
    })

    const body = await Body.create(
      bodyFactory.build({
        content: {
          message: {
            type: 'typein',
          },
        },
        licensee: licensee,
      })
    )

    const data = {
      bodyId: body._id,
    }

    const actions = await transformChatBody(data)

    expect(chatPluginResponseToMessages).toHaveBeenCalledWith(body.content)

    const bodyDeleted = await Body.findById(body._id)
    expect(bodyDeleted).toEqual(null)

    expect(actions.length).toEqual(0)
  })
})
