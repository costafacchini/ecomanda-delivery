import Repository, { RepositoryMemory } from './repository'
import Room from '../models/Room'

class RoomRepositoryDatabase extends Repository {
  model() {
    return Room
  }

  async findFirst(params = {}, relations = ['contact']) {
    return await super.findFirst(params, relations)
  }

  findOpenForContact(contactId: any) {
    return this.findFirst({ contact: contactId, closed: false })
  }
}

class RoomRepositoryMemory extends RepositoryMemory {
  async create(fields: any = {}) {
    return await super.create({
      closed: false,
      ...(fields ?? {}),
    })
  }
}

export { RoomRepositoryDatabase, RoomRepositoryMemory }
