import Repository, { RepositoryMemory } from './repository'
import Inbox from '../models/Inbox'
import { IInbox } from '../../types'

class InboxRepositoryDatabase extends Repository<IInbox> {
  model() {
    return Inbox
  }

  async find(params: any = {}, relations: any[] = []) {
    const query = this.model().find(params ?? {})
    relations.forEach((relation) => query.populate(relation))
    return await query
  }
}

class InboxRepositoryMemory extends RepositoryMemory<IInbox> {}

export { InboxRepositoryDatabase, InboxRepositoryMemory }
