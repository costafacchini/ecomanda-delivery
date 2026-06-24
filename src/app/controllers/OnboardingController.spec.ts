import { OnboardingController } from './OnboardingController'

function buildResponse() {
  return {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

async function runValidations(controller: OnboardingController, req: any) {
  const validations = controller.validations()

  for (const validation of validations) {
    await validation.run(req)
  }
}

const validBody = {
  licenseeName: 'Acme Corp',
  licenseeEmail: 'acme@acme.com',
  phone: '11999990000',
  document: '12345678000195',
  kind: 'company',
  userName: 'John Doe',
  userEmail: 'john@acme.com',
  password: 'senha123',
}

function buildController() {
  const onboardAccount = {
    execute: jest.fn(),
  }

  const controller = new OnboardingController({ onboardAccount })

  return { controller, onboardAccount }
}

describe('OnboardingController', () => {
  describe('onboard', () => {
    it('returns 201 with licensee and user (password stripped) on success', async () => {
      const { controller, onboardAccount } = buildController()
      const req = { body: validBody }
      const res = buildResponse()

      const user = { name: 'John Doe', email: 'john@acme.com', password: 'hashed', toObject: jest.fn() }
      user.toObject.mockReturnValue({ name: 'John Doe', email: 'john@acme.com', password: 'hashed' })
      const licensee = { name: 'Acme Corp' }

      onboardAccount.execute.mockResolvedValue({ licensee, user })

      await controller.onboard(req, res)

      expect(onboardAccount.execute).toHaveBeenCalledWith(req.body)
      expect(res.status).toHaveBeenCalledWith(201)

      const jsonCall = (res.json as jest.Mock).mock.calls[0][0]
      expect(jsonCall.licensee).toEqual(licensee)
      expect(jsonCall.user.password).toBeUndefined()
    })

    it('returns 422 when validation errors are present', async () => {
      const { controller } = buildController()
      const req = { body: { licenseeName: '' } }
      const res = buildResponse()

      await runValidations(controller, req)
      await controller.onboard(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
    })

    it('returns 422 when the use case throws model validation errors', async () => {
      const { controller, onboardAccount } = buildController()
      const req = { body: validBody }
      const res = buildResponse()

      onboardAccount.execute.mockRejectedValue({
        errors: { name: { message: 'Nome: Você deve preencher o campo' } },
      })

      await controller.onboard(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
    })

    it('returns 400 when the use case throws a non-validation error', async () => {
      const { controller, onboardAccount } = buildController()
      const req = { body: validBody }
      const res = buildResponse()

      onboardAccount.execute.mockRejectedValue(new Error('unexpected failure'))

      await controller.onboard(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ message: 'unexpected failure' })
    })
  })

  describe('language validation', () => {
    it('passes language: en to onboardAccount when provided', async () => {
      const { controller, onboardAccount } = buildController()
      const req = { body: { ...validBody, language: 'en' } }
      const res = buildResponse()

      const user = { name: 'John Doe', email: 'john@acme.com', toObject: jest.fn() }
      user.toObject.mockReturnValue({ name: 'John Doe', email: 'john@acme.com' })
      const licensee = { name: 'Acme Corp' }

      onboardAccount.execute.mockResolvedValue({ licensee, user })

      await runValidations(controller, req)
      await controller.onboard(req, res)

      expect(onboardAccount.execute).toHaveBeenCalledWith(expect.objectContaining({ language: 'en' }))
      expect(res.status).toHaveBeenCalledWith(201)
    })

    it('passes language: pt to onboardAccount when language is omitted', async () => {
      const { controller, onboardAccount } = buildController()
      const req = { body: { ...validBody } }
      const res = buildResponse()

      const user = { name: 'John Doe', email: 'john@acme.com', toObject: jest.fn() }
      user.toObject.mockReturnValue({ name: 'John Doe', email: 'john@acme.com' })
      const licensee = { name: 'Acme Corp' }

      onboardAccount.execute.mockResolvedValue({ licensee, user })

      await runValidations(controller, req)
      await controller.onboard(req, res)

      // language field absent from body — use case receives it without language key;
      // OnboardAccount.execute defaults language to 'pt' internally
      expect(onboardAccount.execute).toHaveBeenCalledWith(expect.not.objectContaining({ language: expect.anything() }))
      expect(res.status).toHaveBeenCalledWith(201)
    })

    it('returns 422 when language is an unsupported locale', async () => {
      const { controller } = buildController()
      const req = { body: { ...validBody, language: 'es' } }
      const res = buildResponse()

      await runValidations(controller, req)
      await controller.onboard(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
      const jsonCall = (res.json as jest.Mock).mock.calls[0][0]
      expect(jsonCall.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ message: 'language must be pt or en' })]),
      )
    })
  })
})
