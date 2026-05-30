import { backup } from '../services/Backup'

export default {
  key: 'backup',
  workerEnabled: true,
  async handle() {
    return await backup()
  },
}
