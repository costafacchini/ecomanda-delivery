const { Appsignal } = require('@appsignal/nodejs')

const appsignal = new Appsignal({
  active: true,
  name: 'ecomanda-hub',
})

module.exports = { appsignal }
