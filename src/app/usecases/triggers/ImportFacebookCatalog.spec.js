import { ImportFacebookCatalog } from './ImportFacebookCatalog.js'

describe('ImportFacebookCatalog', () => {
  it('creates the importer for the trigger and delegates the catalog import', async () => {
    const facebookCatalogImporter = {
      importCatalog: jest.fn().mockResolvedValue(undefined),
    }
    const createFacebookCatalogImporter = jest.fn().mockReturnValue(facebookCatalogImporter)
    const importFacebookCatalog = new ImportFacebookCatalog({ createFacebookCatalogImporter })

    await importFacebookCatalog.execute('trigger-id', 'catalog-data')

    expect(createFacebookCatalogImporter).toHaveBeenCalledWith('trigger-id')
    expect(facebookCatalogImporter.importCatalog).toHaveBeenCalledWith('catalog-data')
  })
})
