import Repository from './repository.js'
import Integrationlog from '../models/Integrationlog.js'

class IntegrationlogRepositoryDatabase extends Repository {
  model() {
    return Integrationlog
  }
}

export { IntegrationlogRepositoryDatabase }
