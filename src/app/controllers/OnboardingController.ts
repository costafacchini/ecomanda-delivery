import { check, validationResult } from 'express-validator'
import { sanitizeExpressErrors, sanitizeModelErrors } from '../helpers/SanitizeErrors'

class OnboardingController {
  onboardAccount: any

  constructor({ onboardAccount }: Record<string, any> = {}) {
    this.onboardAccount = onboardAccount
    this.onboard = this.onboard.bind(this)
  }

  validations() {
    return [
      check('licenseeName', 'Nome da empresa deve ser preenchido').notEmpty(),
      check('licenseeEmail', 'Email da empresa deve ser um e-mail válido').isEmail(),
      check('phone', 'Telefone deve ser preenchido').notEmpty(),
      check('document', 'Documento deve ser preenchido').notEmpty(),
      check('kind', 'Tipo deve ser preenchido').notEmpty(),
      check('userName', 'Nome do usuário deve ser preenchido').notEmpty(),
      check('userEmail', 'Email do usuário deve ser um e-mail válido').isEmail(),
      check('password', 'Senha deve ter no mínimo 8 caracteres').isLength({ min: 8 }),
    ]
  }

  async onboard(req: any, res: any) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: sanitizeExpressErrors(errors.array()) })
    }

    try {
      const { licensee, user } = await this.onboardAccount.execute(req.body)
      const userResponse = user?.toObject ? user.toObject() : { ...user }
      delete userResponse.password
      return res.status(201).json({ licensee, user: userResponse })
    } catch (err: any) {
      if (err?.errors) {
        return res.status(422).json({ errors: sanitizeModelErrors(err.errors) })
      }
      return res.status(400).json({ message: err.message })
    }
  }
}

export { OnboardingController }
