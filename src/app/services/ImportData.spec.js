const importData = require('./ImportData')
const EcomandaOldImporter = require('../plugins/importers/ecomanda_old/index')

describe('importData', () => {
  const ecomandaOldImporterimportContactsSpy = jest
    .spyOn(EcomandaOldImporter.prototype, 'importContacts')
    .mockImplementation()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('asks the plugin to import data', async () => {
    const databaseUrl = 'database-url'
    const licenseeId = '609dcb059f560046cde64748'

    await importData(databaseUrl, licenseeId)

    expect(ecomandaOldImporterimportContactsSpy).toHaveBeenCalled()
  })
})
