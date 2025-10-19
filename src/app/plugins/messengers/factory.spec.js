import { createMessengerPlugin } from './factory.js'
import { Utalk } from './Utalk.js'
import { Dialog } from './Dialog.js'
import { YCloud } from './YCloud.js'
import { Pabbly } from './Pabbly.js'
import { licensee as licenseeFactory } from '@factories/licensee'

describe('createMessengerPlugin', () => {
  it('returns the utalk plugin if it is configured on licensee', () => {
    const licensee = licenseeFactory.build({ whatsappDefault: 'utalk' })

    const body = {
      type: 'test',
    }

    const plugin = createMessengerPlugin(licensee, body)

    expect(plugin).toBeInstanceOf(Utalk)
  })

  it('returns the dialog plugin if it is configured on licensee', () => {
    const licensee = licenseeFactory.build({ whatsappDefault: 'dialog' })

    const body = {
      type: 'test',
    }

    const plugin = createMessengerPlugin(licensee, body)

    expect(plugin).toBeInstanceOf(Dialog)
  })

  it('returns the ycloud plugin if it is configured on licensee', () => {
    const licensee = licenseeFactory.build({ whatsappDefault: 'ycloud' })

    const body = {
      type: 'test',
    }

    const plugin = createMessengerPlugin(licensee, body)

    expect(plugin).toBeInstanceOf(YCloud)
  })

  it('returns the pabbly plugin if it is configured on licensee', () => {
    const licensee = licenseeFactory.build({ whatsappDefault: 'pabbly' })

    const body = {
      type: 'test',
    }

    const plugin = createMessengerPlugin(licensee, body)

    expect(plugin).toBeInstanceOf(Pabbly)
  })

  it('throws if option plugin is unknow', () => {
    const licensee = licenseeFactory.build({ whatsappDefault: 'something' })

    const body = {
      field: 'test',
    }

    expect(() => {
      createMessengerPlugin(licensee, body)
    }).toThrow('Plugin de messenger não configurado: something')
  })
})
