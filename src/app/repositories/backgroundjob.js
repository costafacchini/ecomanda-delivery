import Repository from './repository.js'
import Backgroundjob from '../models/Backgroundjob.js'

class BackgroundjobRepositoryDatabase extends Repository {
  model() {
    return Backgroundjob
  }
}

export { BackgroundjobRepositoryDatabase }
