import Repository, { RepositoryMemory } from './repository'
import Department from '../models/Department'

class DepartmentRepositoryDatabase extends Repository {
  model() {
    return Department
  }

  async find(params: any = {}, relations: any[] = []) {
    const query = this.model().find(params ?? {})
    relations.forEach((relation) => query.populate(relation))
    return await query
  }
}

class DepartmentRepositoryMemory extends RepositoryMemory {}

export { DepartmentRepositoryDatabase, DepartmentRepositoryMemory }
