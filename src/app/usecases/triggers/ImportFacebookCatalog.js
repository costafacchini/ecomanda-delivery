class ImportFacebookCatalog {
  constructor({ createFacebookCatalogImporter } = {}) {
    this.createFacebookCatalogImporter = createFacebookCatalogImporter
  }

  async execute(triggerId, data) {
    const facebookCatalogImporter = this.createFacebookCatalogImporter(triggerId)

    await facebookCatalogImporter.importCatalog(data)
  }
}

export { ImportFacebookCatalog }
