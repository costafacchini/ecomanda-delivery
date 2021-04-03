const User = require('@models/user')
const jwt = require('jsonwebtoken')
const SECRET = process.env.SECRET

async function login(req, res) {
  const { email, password } = req.body

  if (email && password) {
    try {
      const user = await User.findOne({ email })
      const validPassword = await user.validPassword(password)
      if (!user || !validPassword) {
        res.status(500).json({ message: 'Email ou senha do usuário inválidos!' })
      } else {
        const token = jwt.sign({ id: user._id }, SECRET, {
          expiresIn: '7d',
        })
        return res.status(200).json({ auth: true, token: token })
      }
    } catch (err) {
      res.status(500).json({ message: `Erro ao tentar fazer login. ${err}` })
    }
  }

  res.status(500).json({ message: 'Login inválido!' })
}

module.exports = { login }
