const CREATE_USER_FIELDS = ['name', 'active', 'password', 'isAdmin', 'isSuper', 'email', 'licensee']

function pickFields(fields: Record<string, any> = {}, keys: any[] = []) {
  return keys.reduce((payload: Record<string, any>, key: any) => {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      payload[key] = fields[key]
    }

    return payload
  }, {})
}

class CreateUser {
  userRepository: any

  constructor({ userRepository }: Record<string, any> = {}) {
    this.userRepository = userRepository
  }

  async execute(fields = {}) {
    return await this.userRepository.create(pickFields(fields, CREATE_USER_FIELDS))
  }
}

export { CreateUser, CREATE_USER_FIELDS }
