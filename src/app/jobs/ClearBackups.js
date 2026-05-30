import { clearBackups } from '../services/ClearBackups'

export default {
  key: 'clear-backups',
  workerEnabled: true,
  async handle() {
    return await clearBackups()
  },
}
