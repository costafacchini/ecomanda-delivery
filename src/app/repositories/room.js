import Repository, { RepositoryMemory } from './repository.js'
import Room from '../models/Room.js'

class RoomRepositoryDatabase extends Repository {
  model() {
    return Room
  }

  async findFirst(params = {}, relations = ['contact']) {
    return await super.findFirst(params, relations)
  }
}

class RoomRepositoryMemory extends RepositoryMemory {
  async create(fields = {}) {
    return await super.create({
      closed: false,
      ...(fields ?? {}),
    })
  }
}

export { RoomRepositoryDatabase, RoomRepositoryMemory }
