import Repository from './repository.js'
import Body from '../models/Body.js'

class BodyRepositoryDatabase extends Repository {
  model() {
    return Body
  }
}

export { BodyRepositoryDatabase }
