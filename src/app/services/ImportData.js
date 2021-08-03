const EcomandaOldImporter = require('../plugins/importers/ecomanda_old/index')

async function importData(body) {
  const { databaseUrl, licenseeId } = body

  const ecomandaOldImporter = new EcomandaOldImporter(licenseeId, databaseUrl)
  await ecomandaOldImporter.importContacts()
}

module.exports = importData
