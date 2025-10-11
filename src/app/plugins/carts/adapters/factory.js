import Default from './Default'
import Gallabox from './Gallabox'
import Alloy from './Alloy'

function createCartAdapter(plugin) {
  if (plugin == 'gallabox') {
    return new Gallabox()
  } else if (plugin == 'alloy') {
    return new Alloy()
  } else {
    return new Default()
  }
}

export default createCartAdapter
