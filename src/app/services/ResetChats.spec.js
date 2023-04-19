const resetChats = require('./ResetChats')
const Licensee = require('@models/Licensee')
const Contact = require('@models/Contact')
const Message = require('@models/Message')
const mongoServer = require('.jest/utils')
const { licenseeComplete: licenseeFactory } = require('@factories/licensee')
const { contact: contactFactory } = require('@factories/contact')
const moment = require('moment')
const Rocketchat = require('../plugins/chats/Rocketchat')

const spySendMessage = jest.spyOn(Rocketchat.prototype, 'sendMessage').mockImplementation()

describe('resetChats', () => {
  jest.spyOn(global.console, 'info').mockImplementation()

  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('when the licensee uses messenger plugin dialog and use whatsapp window', () => {
    describe('when the contact starts a whatsapp chat 23 hours and 50 minutes ago', () => {
      it('send the message to warn the chat that the conversation window is ending', async () => {
        const licensee = await Licensee.create(
          licenseeFactory.build({
            whatsappDefault: 'dialog',
            whatsappUrl: 'https://waba.360dialog.io/',
            whatsappToken: 'ljsdf12g',
            useWhatsappWindow: true,
          })
        )

        const contactWithWhatsappWindowEnding = await Contact.create(
          contactFactory.build({
            licensee,
            wa_start_chat: moment().subtract(23, 'hours').subtract(55, 'minutes'),
          })
        )

        const contactWithWhatsappWindowOnLimitEnding1 = await Contact.create(
          contactFactory.build({
            licensee,
            wa_start_chat: moment().subtract(23, 'hours').subtract(50, 'minutes'),
          })
        )

        const contactWithWhatsappWindowOnLimitEnding2 = await Contact.create(
          contactFactory.build({
            licensee,
            wa_start_chat: moment().subtract(23, 'hours').subtract(59, 'minutes'),
          })
        )

        const contactWithWhatsappWindowExpired1 = await Contact.create(
          contactFactory.build({
            licensee,
            wa_start_chat: moment().subtract(23, 'hours').subtract(49, 'minutes'),
          })
        )

        const licenseeWhatsappWindowOff = await Licensee.create(
          licenseeFactory.build({
            whatsappDefault: 'dialog',
            whatsappUrl: 'https://waba.360dialog.io/',
            whatsappToken: 'ljsdf12g',
            useWhatsappWindow: false,
          })
        )

        const contactLicenseeWindowOff = await Contact.create(
          contactFactory.build({
            licensee: licenseeWhatsappWindowOff,
            wa_start_chat: moment().subtract(23, 'hours').subtract(55, 'minutes'),
          })
        )

        const licenseeThatNotUseDialog = await Licensee.create(
          licenseeFactory.build({
            whatsappDefault: 'utalk',
            whatsappUrl: 'https://utalk.com/',
            whatsappToken: 'ljsdf12g',
            useWhatsappWindow: true,
          })
        )

        const contactLicenseeThatNotUseDialog = await Contact.create(
          contactFactory.build({
            licensee: licenseeThatNotUseDialog,
            wa_start_chat: moment().subtract(23, 'hours').subtract(55, 'minutes'),
          })
        )

        await resetChats()

        const messages = await Message.find()

        expect(messages.length).toEqual(3)
        expect(spySendMessage).toHaveBeenCalledTimes(3)

        expect(messages).toEqual(
          expect.arrayContaining([expect.objectContaining({ contact: contactWithWhatsappWindowEnding._id })])
        )
        expect(messages).toEqual(
          expect.arrayContaining([expect.objectContaining({ contact: contactWithWhatsappWindowOnLimitEnding1._id })])
        )
        expect(messages).toEqual(
          expect.arrayContaining([expect.objectContaining({ contact: contactWithWhatsappWindowOnLimitEnding2._id })])
        )
        expect(messages).toEqual(
          expect.arrayContaining([expect.not.objectContaining({ contact: contactWithWhatsappWindowExpired1._id })])
        )
        expect(messages).toEqual(
          expect.arrayContaining([expect.not.objectContaining({ contact: contactLicenseeWindowOff._id })])
        )
        expect(messages).toEqual(
          expect.arrayContaining([expect.not.objectContaining({ contact: contactLicenseeThatNotUseDialog._id })])
        )
      })

      it('send the message to notify the chat that the conversation window has expired ans clear field on contact', async () => {
        const licensee = await Licensee.create(
          licenseeFactory.build({
            whatsappDefault: 'dialog',
            whatsappUrl: 'https://waba.360dialog.io/',
            whatsappToken: 'ljsdf12g',
            useWhatsappWindow: true,
          })
        )

        const contactWithWhatsappWindowEnding = await Contact.create(
          contactFactory.build({
            licensee,
            wa_start_chat: moment().subtract(24, 'hours').subtract(10, 'minutes'),
          })
        )

        const contactWithWhatsappWindowOnLimitEnding1 = await Contact.create(
          contactFactory.build({
            licensee,
            wa_start_chat: moment().subtract(24, 'hours'),
          })
        )

        const licenseeWhatsappWindowOff = await Licensee.create(
          licenseeFactory.build({
            whatsappDefault: 'dialog',
            whatsappUrl: 'https://waba.360dialog.io/',
            whatsappToken: 'ljsdf12g',
            useWhatsappWindow: false,
          })
        )

        const contactLicenseeWindowOff = await Contact.create(
          contactFactory.build({
            licensee: licenseeWhatsappWindowOff,
            wa_start_chat: moment().subtract(24, 'hours').subtract(10, 'minutes'),
          })
        )

        const licenseeThatNotUseDialog = await Licensee.create(
          licenseeFactory.build({
            whatsappDefault: 'utalk',
            whatsappUrl: 'https://utalk.com/',
            whatsappToken: 'ljsdf12g',
            useWhatsappWindow: true,
          })
        )

        const contactLicenseeThatNotUseDialog = await Contact.create(
          contactFactory.build({
            licensee: licenseeThatNotUseDialog,
            wa_start_chat: moment().subtract(24, 'hours').subtract(10, 'minutes'),
          })
        )

        await resetChats()

        const messages = await Message.find()

        expect(messages.length).toEqual(2)
        expect(spySendMessage).toHaveBeenCalledTimes(2)

        expect(messages).toEqual(
          expect.arrayContaining([expect.objectContaining({ contact: contactWithWhatsappWindowEnding._id })])
        )
        expect(messages).toEqual(
          expect.arrayContaining([expect.objectContaining({ contact: contactWithWhatsappWindowOnLimitEnding1._id })])
        )
        expect(messages).toEqual(
          expect.arrayContaining([expect.not.objectContaining({ contact: contactLicenseeWindowOff._id })])
        )
        expect(messages).toEqual(
          expect.arrayContaining([expect.not.objectContaining({ contact: contactLicenseeThatNotUseDialog._id })])
        )

        const contactWithWhatsappWindowEndingUpdated = Contact.findById(contactWithWhatsappWindowEnding._id)
        expect(contactWithWhatsappWindowEndingUpdated.wa_start_chat).toEqual(undefined)

        const contactWithWhatsappWindowOnLimitEnding1Updated = Contact.findById(
          contactWithWhatsappWindowOnLimitEnding1._id
        )
        expect(contactWithWhatsappWindowOnLimitEnding1Updated.wa_start_chat).toEqual(undefined)
      })
    })
  })
})
