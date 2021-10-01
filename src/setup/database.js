const User = require('@models/User')
const DEFAULT_USER = process.env.DEFAULT_USER
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD

async function createDefaultUser() {
  try {
    const count = await User.countDocuments()
    if (count === 0) {
      await User.create({ name: 'Default user', email: DEFAULT_USER, password: DEFAULT_PASSWORD, isAdmin: true })
    }
  } catch (err) {
    throw new Error(`Não foi possível criar o usuário padrão. Erro: ${err}`)
  }
}

module.exports = { createDefaultUser }
