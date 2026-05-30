const UPDATE_USER_FIELDS = ['name', 'active', 'password', 'isAdmin', 'isSuper', 'email']

function pickFields(fields = {}, keys = []) {
  return keys.reduce((payload, key) => {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      payload[key] = fields[key]
    }

    return payload
  }, {})
}

class UpdateUser {
  userRepository: any

  constructor({ userRepository }: Record<string, any> = {}) {
    this.userRepository = userRepository
  }

  async execute(id, fields = {}) {
    await this.userRepository.update(id, pickFields(fields, UPDATE_USER_FIELDS))

    return await this.userRepository.findFirst({ _id: id })
  }
}

export { UpdateUser, UPDATE_USER_FIELDS }
