const importData = require('../services/ImportData')

module.exports = {
  key: 'import-data',
  async handle(data) {
    return await importData(data.body)
  },
}
