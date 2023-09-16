const transformChatBody = require('./ChatMessage')
const Licensee = require('@models/Licensee')
const Body = require('@models/Body')
const Rocketchat = require('../plugins/chats/Rocketchat')
const mongoServer = require('.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { body: bodyFactory } = require('@factories/body')
const { contactWithWhatsappWindowClosed } = require('@repositories/contact')

jest.mock('@repositories/contact')

describe('transformChatBody', () => {
  let licensee

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()

    licensee = await Licensee.create(
      licenseeFactory.build({
        chatDefault: 'rocketchat',
        chatUrl: 'https://www.jivo.chat.com',
        whatsappDefault: 'dialog',
        whatsappUrl: 'https://waba.360dialog.io/',
        whatsappToken: 'token',
      })
    )
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('responds with action to dispatcher action of plugin and delete body', async () => {
    const chatPluginResponseToMessages = jest
      .spyOn(Rocketchat.prototype, 'responseToMessages')
      .mockImplementation(() => {
        return [
          { _id: 'KSDF656DSD91NSE', contact: { _id: 'id-contact-1' } },
          { _id: 'OAR8Q54LDN02T', contact: { _id: 'id-contact-1' } },
        ]
      })

    contactWithWhatsappWindowClosed.mockResolvedValue(false)

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
    expect(actions[0].body).toEqual({ messageId: 'KSDF656DSD91NSE', url: 'https://waba.360dialog.io/', token: 'token' })

    expect(actions[1].action).toEqual('send-message-to-messenger')
    expect(actions[1].body).toEqual({ messageId: 'OAR8Q54LDN02T', url: 'https://waba.360dialog.io/', token: 'token' })

    expect(actions.length).toEqual(2)
  })

  it('responds message to chat if contact with whatsapp window closed and message is not template', async () => {
    const chatPluginResponseToMessages = jest
      .spyOn(Rocketchat.prototype, 'responseToMessages')
      .mockImplementation(() => {
        return [
          { _id: 'KSDF656DSD91NSE', contact: { _id: 'id-contact-1' }, kind: 'text' },
          { _id: 'OAR8Q54LDN02T', contact: { _id: 'id-contact-1' } },
        ]
      })

    contactWithWhatsappWindowClosed.mockResolvedValue(true)

    const licensee = await Licensee.create(
      licenseeFactory.build({
        chatDefault: 'rocketchat',
        chatUrl: 'https://www.jivo.chat.com',
        whatsappDefault: 'dialog',
        whatsappUrl: 'https://waba.360dialog.io/',
        whatsappToken: 'token',
        useWhatsappWindow: true,
      })
    )

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

    expect(actions[0].action).toEqual('send-message-to-chat')
    expect(actions[0].body).toEqual(expect.objectContaining({ url: 'https://www.jivo.chat.com', token: '' }))

    expect(actions.length).toEqual(1)
  })

  it('responds with action to dispatcher action of plugin if contact with whatsapp window closed and message is template', async () => {
    const chatPluginResponseToMessages = jest
      .spyOn(Rocketchat.prototype, 'responseToMessages')
      .mockImplementation(() => {
        return [{ _id: 'KSDF656DSD91NSE', contact: { _id: 'id-contact-1' }, kind: 'template' }]
      })

    contactWithWhatsappWindowClosed.mockResolvedValue(true)

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
    expect(actions[0].body).toEqual({ messageId: 'KSDF656DSD91NSE', url: 'https://waba.360dialog.io/', token: 'token' })

    expect(actions.length).toEqual(1)
  })

  it('responds with blank actions if body is invalid and delete body', async () => {
    const chatPluginResponseToMessages = jest
      .spyOn(Rocketchat.prototype, 'responseToMessages')
      .mockImplementation(() => {
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
