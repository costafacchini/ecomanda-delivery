import Repository from './repository.js'
import User from '../models/User.js'

class UserRepositoryDatabase extends Repository {
  model() {
    return User
  }

  async create(fields = {}) {
    const user = new User({ ...(fields ?? {}) })

    return await user.save()
  }

  async find(params = {}, projection = {}) {
    return await User.find(params ?? {}, projection ?? {})
  }
}

export { UserRepositoryDatabase }
