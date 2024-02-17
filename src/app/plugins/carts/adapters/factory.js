const Default = require('./Default')
const Gallabox = require('./Gallabox')
const Alloy = require('./Alloy')

function createCartAdapter(plugin) {
  if (plugin == 'gallabox') {
    return new Gallabox()
  } else if (plugin == 'alloy') {
    return new Alloy()
  } else {
    return new Default()
  }
}

module.exports = createCartAdapter
