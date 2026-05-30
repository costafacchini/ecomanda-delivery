import Repository, { RepositoryMemory } from './repository'
import WhatsappSession from '../models/WhatsappSession'

class WhatsappSessionRepositoryDatabase extends Repository {
  model() {
    return WhatsappSession
  }
}

class WhatsappSessionRepositoryMemory extends RepositoryMemory {}

export { WhatsappSessionRepositoryDatabase, WhatsappSessionRepositoryMemory }
