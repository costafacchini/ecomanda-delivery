import { UserRepositoryDatabase } from '../repositories/user.js'
import jwt from 'jsonwebtoken'
const SECRET = process.env.SECRET

async function login(
  req,
  res,
  { userRepository = new UserRepositoryDatabase(), signToken = jwt.sign, secret = SECRET } = {},
) {
  const { email, password } = req.body

  if (email && password) {
    try {
      const user = await userRepository.findFirst({ email, active: true })
      const validPassword = user ? await user.validPassword(password) : null
      if (!user || !validPassword) {
        return res.status(401).json({ message: 'Email ou senha inválidos!' })
      } else {
        const token = signToken({ id: user._id }, secret, {
          expiresIn: '7d',
        })
        return res.status(200).json({ token: token })
      }
    } catch (err) {
      return res.status(500).json({ message: `Erro ao tentar fazer login. ${err}` })
    }
  }

  res.status(401).json({ message: 'Login inválido!' })
}

export { login }
