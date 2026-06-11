import Repository, { RepositoryMemory } from './repository'
import Sector from '../models/Sector'

class SectorRepositoryDatabase extends Repository {
  model() {
    return Sector
  }

  async find(params: any = {}, relations: any[] = []) {
    const query = this.model().find(params ?? {})
    relations.forEach((relation) => query.populate(relation))
    return await query
  }
}

class SectorRepositoryMemory extends RepositoryMemory {}

export { SectorRepositoryDatabase, SectorRepositoryMemory }
