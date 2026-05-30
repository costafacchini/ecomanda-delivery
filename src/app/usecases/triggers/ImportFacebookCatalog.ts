class ImportFacebookCatalog {
  createFacebookCatalogImporter: any

  constructor({ createFacebookCatalogImporter }: Record<string, any> = {}) {
    this.createFacebookCatalogImporter = createFacebookCatalogImporter
  }

  async execute(triggerId, data) {
    const facebookCatalogImporter = this.createFacebookCatalogImporter(triggerId)

    await facebookCatalogImporter.importCatalog(data)
  }
}

export { ImportFacebookCatalog }
