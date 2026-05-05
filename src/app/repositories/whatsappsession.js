import Repository, { RepositoryMemory } from './repository.js'
import WhatsappSession from '../models/WhatsappSession.js'

class WhatsappSessionRepositoryDatabase extends Repository {
  model() {
    return WhatsappSession
  }
}

class WhatsappSessionRepositoryMemory extends RepositoryMemory {}

export { WhatsappSessionRepositoryDatabase, WhatsappSessionRepositoryMemory }
