import clearBackups from '../services/ClearBackups'

export default {
  key: 'clear-backups',
  async handle() {
    return await clearBackups()
  },
}
