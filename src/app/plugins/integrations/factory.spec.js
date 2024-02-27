const createIntegrator = require('./factory')
const IntegratorBase = require('./IntegratorBase')

describe('createIntegrator', () => {
  it('returns the base integrator', () => {
    const plugin = createIntegrator()

    expect(plugin).toBeInstanceOf(IntegratorBase)
  })
})
