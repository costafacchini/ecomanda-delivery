import createCartAdapter from './factory.js'
import Default from './Default.js'
import Gallabox from './Gallabox.js'
import Alloy from './Alloy.js'

describe('createCartAdapter', () => {
  it('returns the gallabox adapter', () => {
    const plugin = createCartAdapter('gallabox')

    expect(plugin).toBeInstanceOf(Gallabox)
  })

  it('returns the alloy adapter', () => {
    const plugin = createCartAdapter('alloy')

    expect(plugin).toBeInstanceOf(Alloy)
  })

  it('returns the default adapter', () => {
    const plugin = createCartAdapter('')

    expect(plugin).toBeInstanceOf(Default)
  })
})
