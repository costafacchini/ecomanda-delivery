import { backup } from '../services/Backup.js'

export default {
  key: 'backup',
  workerEnabled: true,
  async handle() {
    return await backup()
  },
}
