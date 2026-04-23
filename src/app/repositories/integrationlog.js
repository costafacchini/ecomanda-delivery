import Repository, { RepositoryMemory } from './repository.js'
import Integrationlog from '../models/Integrationlog.js'

class IntegrationlogRepositoryDatabase extends Repository {
  model() {
    return Integrationlog
  }
}

class IntegrationlogRepositoryMemory extends RepositoryMemory {}

export { IntegrationlogRepositoryDatabase, IntegrationlogRepositoryMemory }
