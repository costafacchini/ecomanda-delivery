const createMessengerPlugin = require('./factory')
const Licensee = require('@models/Licensee')
const Chatapi = require('./Chatapi')
const Utalk = require('./Utalk')
const Winzap = require('./Winzap')
const Dialog = require('./Dialog')
const { licensee: licenseeFactory } = require('@factories/licensee')

describe('createMessengerPlugin', () => {
  it('returns the chatapi plugin if it is configured on licensee', () => {
    const licensee = new Licensee(
      licenseeFactory.build({
        whatsappDefault: 'chatapi',
      })
    )

    const body = {
      message: 'test',
    }

    const plugin = createMessengerPlugin(licensee, body)

    expect(plugin).toBeInstanceOf(Chatapi)
  })

  it('returns the utalk plugin if it is configured on licensee', () => {
    const licensee = new Licensee(
      licenseeFactory.build({
        whatsappDefault: 'utalk',
      })
    )

    const body = {
      type: 'test',
    }

    const plugin = createMessengerPlugin(licensee, body)

    expect(plugin).toBeInstanceOf(Utalk)
  })

  it('returns the winzap plugin if it is configured on licensee', () => {
    const licensee = new Licensee(
      licenseeFactory.build({
        whatsappDefault: 'winzap',
      })
    )

    const body = {
      type: 'test',
    }

    const plugin = createMessengerPlugin(licensee, body)

    expect(plugin).toBeInstanceOf(Winzap)
  })

  it('returns the dialog plugin if it is configured on licensee', () => {
    const licensee = new Licensee(
      licenseeFactory.build({
        whatsappDefault: 'dialog',
      })
    )

    const body = {
      type: 'test',
    }

    const plugin = createMessengerPlugin(licensee, body)

    expect(plugin).toBeInstanceOf(Dialog)
  })

  it('throws if option plugin is unknow', () => {
    const licensee = new Licensee(
      licenseeFactory.build({
        whatsappDefault: 'something',
      })
    )

    const body = {
      field: 'test',
    }

    expect(() => {
      createMessengerPlugin(licensee, body)
    }).toThrow('Plugin de messenger não configurado: something')
  })
})
