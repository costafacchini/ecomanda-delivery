import User from '../app/models/User.js'

const DEFAULT_USER = process.env.DEFAULT_USER
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD

async function createDefaultUser() {
  try {
    const existingUser = await User.findOne({ email: DEFAULT_USER })
    if (existingUser) {
      return existingUser
    }

    try {
      return await User.create({
        name: 'Default user',
        email: DEFAULT_USER,
        password: DEFAULT_PASSWORD,
        isAdmin: true,
        isSuper: true,
      })
    } catch (err) {
      if (err?.code === 11000) {
        return await User.findOne({ email: DEFAULT_USER })
      }

      throw err
    }
  } catch (err) {
    throw new Error(`Não foi possível criar o usuário padrão. Erro: ${err}`, { cause: err })
  }
}

export { createDefaultUser }
