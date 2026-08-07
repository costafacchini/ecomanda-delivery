import { IRepository } from '@repositories/repository'
import { IUser } from '../../../types'

const UPDATE_USER_FIELDS = ['name', 'active', 'password', 'role', 'email', 'licensee']

interface UpdateUserDeps {
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

class UpdateUser {
  userRepository: IRepository<IUser>

  constructor({ userRepository }: UpdateUserDeps) {
    this.userRepository = userRepository
  }

  async execute(id: string, fields: Record<string, any> = {}): Promise<IUser | null> {
    await this.userRepository.update(id, pickFields(fields, UPDATE_USER_FIELDS))

    return await this.userRepository.findFirst({ _id: id })
  }
}

export { UpdateUser, UPDATE_USER_FIELDS }
