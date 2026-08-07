import Repository, { RepositoryMemory } from './repository'
import Body from '../models/Body'
import { IBody } from '../../types'

class BodyRepositoryDatabase extends Repository<IBody> {
  model() {
    return Body
  }
}

class BodyRepositoryMemory extends RepositoryMemory<IBody> {}

export { BodyRepositoryDatabase, BodyRepositoryMemory }
