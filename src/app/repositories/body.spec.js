import mongoServer from '../../../.jest/utils'
import Body from '@models/Body'
import { body as bodyFactory } from '@factories/body'
import { licensee as licenseeFactory } from '@factories/licensee'
import { BodyRepositoryDatabase } from '@repositories/body'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'

describe('body repository database', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('#model', () => {
    it('returns a model', () => {
      const bodyRepository = new BodyRepositoryDatabase()

      expect(bodyRepository.model()).toEqual(Body)
    })
  })

  describe('#create', () => {
    it('creates a body', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const bodyRepository = new BodyRepositoryDatabase()
      const body = await bodyRepository.create(bodyFactory.build({ licensee }))

      expect(body).toEqual(
        expect.objectContaining({
          kind: 'normal',
          licensee,
          content: expect.objectContaining({ message: 'text' }),
        }),
      )
    })
  })

  describe('#save', () => {
    it('saves a body document', async () => {
      const licenseeRepository = new LicenseeRepositoryDatabase()
      const licensee = await licenseeRepository.create(licenseeFactory.build())

      const bodyRepository = new BodyRepositoryDatabase()
      const body = await bodyRepository.create(bodyFactory.build({ licensee }))

      body.concluded = true
      await bodyRepository.save(body)

      const bodySaved = await bodyRepository.findFirst({ _id: body._id }, ['licensee'])
      expect(bodySaved.concluded).toEqual(true)
      expect(bodySaved.licensee).toEqual(expect.objectContaining({ _id: licensee._id }))
    })
  })
})
