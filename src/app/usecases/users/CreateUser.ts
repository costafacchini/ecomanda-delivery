import { IRepository } from '@repositories/repository'
import { IUser } from '../../../types'

const CREATE_USER_FIELDS = ['name', 'active', 'password', 'role', 'email', 'licensee']

interface CreateUserDeps {
  userRepository: IRepository<IUser>
}

function pickFields(fields: Record<string, any> = {}, keys: string[] = []) {
  return keys.reduce((payload: Record<string, any>, key: string) => {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      payload[key] = fields[key]
    }

    return payload
  }, {})
}

class CreateUser {
  userRepository: IRepository<IUser>

  constructor({ userRepository }: CreateUserDeps) {
    this.userRepository = userRepository
  }

  async execute(fields: Record<string, any> = {}): Promise<IUser> {
    return await this.userRepository.create(pickFields(fields, CREATE_USER_FIELDS))
  }
}

export { CreateUser, CREATE_USER_FIELDS }
