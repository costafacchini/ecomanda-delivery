import { sanitizeExpressErrors, sanitizeModelErrors } from './SanitizeErrors'

describe('#sanitizeExpressErrors', () => {
  const expressErrors = [
    {
      value: 'maryjane.com',
      msg: 'Email deve ser preenchido com um valor válido',
      param: 'email',
      location: 'body',
    },
  ]

  it('normalizes the errors generated in the validation of the express', () => {
    expect(sanitizeExpressErrors(expressErrors)).toEqual([{ message: 'Email deve ser preenchido com um valor válido' }])
  })
})

describe('#sanitizeModelErrors', () => {
  const modelErrors = {
    errors: {
      name: {
        name: 'ValidatorError',
        message: 'Nome: Informe um valor com mais que 4 caracteres! Atual: Sil',
        properties: {
          message: 'Nome: Informe um valor com mais que 4 caracteres! Atual: Sil',
          type: 'user defined',
          path: 'name',
          value: 'Sil',
        },
        kind: 'user defined',
        path: 'name',
        value: 'Sil',
      },
      password: {
        name: 'ValidatorError',
        message: 'Senha: Informe um valor com mais que 8 caracteres!',
        properties: {
          message: 'Senha: Informe um valor com mais que 8 caracteres!',
          type: 'user defined',
          path: 'password',
          value: '123456',
        },
        kind: 'user defined',
        path: 'password',
        value: '123456',
      },
    },
    _message: 'User validation failed',
    name: 'ValidationError',
    message:
      'User validation failed: name: Nome: Informe um valor com mais que 4 caracteres! Atual: Sil, password: Senha: Informe um valor com mais que 8 caracteres!',
  }

  it('normalizes the errors generated in the validation of the models', () => {
    expect(sanitizeModelErrors(modelErrors.errors)).toEqual([
      { message: 'Nome: Informe um valor com mais que 4 caracteres! Atual: Sil' },
      { message: 'Senha: Informe um valor com mais que 8 caracteres!' },
    ])
  })
})
