import createIntegrator from './factory.js'
import IntegratorBase from './IntegratorBase.js'

describe('createIntegrator', () => {
  it('returns the base integrator', () => {
    const plugin = createIntegrator()

    expect(plugin).toBeInstanceOf(IntegratorBase)
  })
})
