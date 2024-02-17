const createCartAdapter = require('./factory')
const Default = require('./Default')
const Gallabox = require('./Gallabox')
const Alloy = require('./Alloy')

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
