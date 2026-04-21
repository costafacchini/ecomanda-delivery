import Repository from './repository.js'
import User from '../models/User.js'

class UserRepositoryDatabase extends Repository {
  model() {
    return User
  }
}

export { UserRepositoryDatabase }
