import Go2go from './Go2go'
import Go2goV2 from './Go2goV2'
import Alloy from './Alloy'

function createCartPlugin(licensee) {
  switch (licensee.cartDefault) {
    case 'go2go':
      return new Go2go()
    case 'go2go_v2':
      return new Go2goV2()
    case 'alloy':
      return new Alloy()
    default:
      throw `Plugin de cart não configurado: ${licensee.cartDefault}`
  }
}

export default createCartPlugin
