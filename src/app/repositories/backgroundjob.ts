import Repository, { RepositoryMemory } from './repository'
import Backgroundjob from '../models/Backgroundjob'

class BackgroundjobRepositoryDatabase extends Repository {
  model() {
    return Backgroundjob
  }

  async create(fields: any = {}) {
    const backgroundjob = new Backgroundjob({ ...(fields ?? {}) })

    return await this.save(backgroundjob)
  }
}

class BackgroundjobRepositoryMemory extends RepositoryMemory {}

export { BackgroundjobRepositoryDatabase, BackgroundjobRepositoryMemory }
