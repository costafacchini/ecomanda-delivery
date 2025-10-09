import Default from './Default.js'
import Gallabox from './Gallabox.js'
import Alloy from './Alloy.js'

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
