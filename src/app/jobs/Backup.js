import { backup } from '../services/Backup.js'

export default {
  key: 'backup',
  async handle() {
    return await backup()
  },
}
