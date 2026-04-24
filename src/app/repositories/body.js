import Repository, { RepositoryMemory } from './repository.js'
import Body from '../models/Body.js'

class BodyRepositoryDatabase extends Repository {
  model() {
    return Body
  }
}

class BodyRepositoryMemory extends RepositoryMemory {}

export { BodyRepositoryDatabase, BodyRepositoryMemory }
