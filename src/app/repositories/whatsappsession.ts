import Repository, { RepositoryMemory } from './repository'
import WhatsappSession from '../models/WhatsappSession'
import { IWhatsappSession } from '../../types'

class WhatsappSessionRepositoryDatabase extends Repository<IWhatsappSession> {
  model() {
    return WhatsappSession
  }
}

class WhatsappSessionRepositoryMemory extends RepositoryMemory<IWhatsappSession> {}

export { WhatsappSessionRepositoryDatabase, WhatsappSessionRepositoryMemory }
