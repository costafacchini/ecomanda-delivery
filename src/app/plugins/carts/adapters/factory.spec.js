const createCartAdapter = require('./factory')
const Default = require('./Default')
const Gallabox = require('./Gallabox')
const { licensee: licenseeFactory } = require('@factories/licensee')

describe('createCartAdapter', () => {
  it('returns the gallabox adapter if licensee using gallabox', () => {
    const licensee = licenseeFactory.build({ useCartGallabox: true })

    const plugin = createCartAdapter(licensee)

    expect(plugin).toBeInstanceOf(Gallabox)
  })

  it('returns the default adapter if licensee not using gallabox', () => {
    const licensee = licenseeFactory.build({ useCartGallabox: false })

    const plugin = createCartAdapter(licensee)

    expect(plugin).toBeInstanceOf(Default)
  })
})
