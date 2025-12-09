import { clearBackups } from '../services/ClearBackups.js'

export default {
  key: 'clear-backups',
  workerEnabled: true,
  async handle() {
    return await clearBackups()
  },
}
