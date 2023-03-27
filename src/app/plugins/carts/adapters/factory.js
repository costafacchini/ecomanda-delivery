const Default = require('./Default')
const Gallabox = require('./Gallabox')

function createCartAdapter(licensee) {
  if (licensee.useCartGallabox) {
    return new Gallabox()
  } else {
    return new Default()
  }
}

module.exports = createCartAdapter
