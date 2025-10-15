import { clearBackups } from '../services/ClearBackups.js'

export default {
  key: 'clear-backups',
  async handle() {
    return await clearBackups()
  },
}
