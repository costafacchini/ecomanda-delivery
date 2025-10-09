import User from '@models/User.js'
import jwt from 'jsonwebtoken'
const SECRET = process.env.SECRET

async function login(req, res) {
  const { email, password } = req.body

  if (email && password) {
    try {
      const user = await User.findOne({ email, active: true })
      const validPassword = user ? await user.validPassword(password) : null
      if (!user || !validPassword) {
        return res.status(401).json({ message: 'Email ou senha inválidos!' })
      } else {
        const token = jwt.sign({ id: user._id }, SECRET, {
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

export default { login }
