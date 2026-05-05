const CREATE_USER_FIELDS = ['name', 'active', 'password', 'isAdmin', 'isSuper', 'email', 'licensee']

function pickFields(fields = {}, keys = []) {
  return keys.reduce((payload, key) => {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      payload[key] = fields[key]
    }

    return payload
  }, {})
}

class CreateUser {
  constructor({ userRepository } = {}) {
    this.userRepository = userRepository
  }

  async execute(fields = {}) {
    return await this.userRepository.create(pickFields(fields, CREATE_USER_FIELDS))
  }
}

export { CreateUser, CREATE_USER_FIELDS }
