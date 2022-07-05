const createMessengerPlugin = require('./factory')
const Licensee = require('@models/Licensee')
const Utalk = require('./Utalk')
const Dialog = require('./Dialog')
const { licensee: licenseeFactory } = require('@factories/licensee')

describe('createMessengerPlugin', () => {
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
