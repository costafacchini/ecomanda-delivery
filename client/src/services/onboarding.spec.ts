import * as apiModule from './api'
import { createAccount } from './onboarding'

vi.mock('./api')

describe('onboarding service', () => {
  let mockPost: any

  beforeEach(() => {
    mockPost = vi.fn().mockResolvedValue({ status: 201, data: {} })
    ;(apiModule.default as any).mockReturnValue({ post: mockPost })
  })

  describe('createAccount', () => {
    const fields = {
      licenseeName: 'Acme Corp',
      kind: 'company',
      document: '12345678000195',
      licenseeEmail: 'acme@acme.com',
      phone: '11999990000',
      userName: 'John Doe',
      userEmail: 'john@acme.com',
      password: 'senha123',
    }

    it('sends POST to /onboarding with the provided fields', async () => {
      await createAccount(fields)
      expect(mockPost).toHaveBeenCalledWith('/onboarding', { body: fields })
    })

    it('does not include an x-access-token header', async () => {
      await createAccount(fields)
      const callArgs = mockPost.mock.calls[0][1]
      expect(callArgs.headers).toBeUndefined()
    })
  })
})
