import backup from '../services/Backup'

export default {
  key: 'backup',
  async handle() {
    return await backup()
  },
}
