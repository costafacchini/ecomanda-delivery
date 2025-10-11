import createCartAdapter from './factory'
import Default from './Default'
import Gallabox from './Gallabox'
import Alloy from './Alloy'

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
