import Repository, { RepositoryMemory } from './repository'
import Body from '../models/Body'

class BodyRepositoryDatabase extends Repository {
  model() {
    return Body
  }
}

class BodyRepositoryMemory extends RepositoryMemory {}

export { BodyRepositoryDatabase, BodyRepositoryMemory }
