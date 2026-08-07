import Repository, { RepositoryMemory } from './repository'
import Department from '../models/Department'
import { IDepartment } from '../../types'

class DepartmentRepositoryDatabase extends Repository<IDepartment> {
  model() {
    return Department
  }

  async find(params: any = {}, relations: any[] = []) {
    const query = this.model().find(params ?? {})
    relations.forEach((relation) => query.populate(relation))
    return await query
  }
}

class DepartmentRepositoryMemory extends RepositoryMemory<IDepartment> {}

export { DepartmentRepositoryDatabase, DepartmentRepositoryMemory }
