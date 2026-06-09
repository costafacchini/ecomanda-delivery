import Repository, { RepositoryMemory } from './repository'
import Setor from '../models/Setor'

class SetorRepositoryDatabase extends Repository {
  model() {
    return Setor
  }

  async find(params: any = {}, relations: any[] = []) {
    const query = this.model().find(params ?? {})
    relations.forEach((relation) => query.populate(relation))
    return await query
  }
}

class SetorRepositoryMemory extends RepositoryMemory {}

export { SetorRepositoryDatabase, SetorRepositoryMemory }
