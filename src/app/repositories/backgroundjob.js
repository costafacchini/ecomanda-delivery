import Repository from './repository.js'
import Backgroundjob from '../models/Backgroundjob.js'

class BackgroundjobRepositoryDatabase extends Repository {
  model() {
    return Backgroundjob
  }

  async create(fields = {}) {
    const backgroundjob = new Backgroundjob({ ...(fields ?? {}) })

    return await backgroundjob.save()
  }
}

export { BackgroundjobRepositoryDatabase }
