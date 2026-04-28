import { Go2go } from './Go2go.js'
import { Go2goV2 } from './Go2goV2.js'
import { Alloy } from './Alloy.js'

function createCartPlugin(licensee, dependencies = {}) {
  switch (licensee.cartDefault) {
    case 'go2go':
      return new Go2go(dependencies)
    case 'go2go_v2':
      return new Go2goV2(dependencies)
    case 'alloy':
      return new Alloy(dependencies)
    default:
      throw `Plugin de cart não configurado: ${licensee.cartDefault}`
  }
}

export { createCartPlugin }
