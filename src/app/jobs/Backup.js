const backup = require('../services/Backup')

module.exports = {
  key: 'backup',
  async handle() {
    return await backup()
  },
}
