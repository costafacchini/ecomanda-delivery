import Repository, { RepositoryMemory } from './repository.js'
import Backgroundjob from '../models/Backgroundjob.js'

class BackgroundjobRepositoryDatabase extends Repository {
  model() {
    return Backgroundjob
  }

  async create(fields = {}) {
    return await Backgroundjob.create({ ...(fields ?? {}) })
  }
}

class BackgroundjobRepositoryMemory extends RepositoryMemory {}

export { BackgroundjobRepositoryDatabase, BackgroundjobRepositoryMemory }
