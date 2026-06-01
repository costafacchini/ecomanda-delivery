import Repository, { RepositoryMemory } from './repository'
import Integrationlog from '../models/Integrationlog'

class IntegrationlogRepositoryDatabase extends Repository {
  model() {
    return Integrationlog
  }
}

class IntegrationlogRepositoryMemory extends RepositoryMemory {}

export { IntegrationlogRepositoryDatabase, IntegrationlogRepositoryMemory }
