import createMessengerPlugin from './factory'
import Utalk from './Utalk'
import Dialog from './Dialog'
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
