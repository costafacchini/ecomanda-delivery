const clearBackups = require('../services/ClearBackups')

module.exports = {
  key: 'clear-backups',
  async handle() {
    return await clearBackups()
  },
}
