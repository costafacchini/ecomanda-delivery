import createIntegrator from './factory'
import IntegratorBase from './IntegratorBase'

describe('createIntegrator', () => {
  it('returns the base integrator', () => {
    const plugin = createIntegrator()

    expect(plugin).toBeInstanceOf(IntegratorBase)
  })
})
