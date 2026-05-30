class ImportFacebookCatalog {
  createFacebookCatalogImporter: any

  constructor({ createFacebookCatalogImporter }: Record<string, any> = {}) {
    this.createFacebookCatalogImporter = createFacebookCatalogImporter
  }

  async execute(triggerId: any, data: any) {
    const facebookCatalogImporter = this.createFacebookCatalogImporter(triggerId)

    await facebookCatalogImporter.importCatalog(data)
  }
}

export { ImportFacebookCatalog }
