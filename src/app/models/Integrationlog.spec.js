import Integrationlog from '@models/Integrationlog.js'
import mongoServer from '../../../.jest/utils.js'
import { licensee as licenseeFactory   } from '@factories/licensee.js'
import { integrationlog as integrationlogFactory   } from '@factories/integrationlog.js'
import { LicenseeRepositoryDatabase  } from '@repositories/licensee.js'

describe('Integrationlog', () => {
  let licensee

  beforeEach(async () => {
    await mongoServer.connect()

    const licenseeRepository = new LicenseeRepositoryDatabase()
    licensee = await licenseeRepository.create(licenseeFactory.build())
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const integrationlog = await Integrationlog.create(integrationlogFactory.build({ licensee }))

      expect(integrationlog._id).not.toEqual(null)
    })

    it('does not changes _id if integrationlog is changed', async () => {
      const integrationlog = await Integrationlog.create(integrationlogFactory.build({ licensee }))

      integrationlog.talkingWithChatBot = true
      const alteredintegrationlog = await integrationlog.save()

      expect(integrationlog._id).toEqual(alteredintegrationlog._id)
      expect(alteredintegrationlog.talkingWithChatBot).toEqual(true)
    })
  })

  describe('validations', () => {
    describe('licensee', () => {
      it('is required', () => {
        const integrationlog = new Integrationlog({})
        const validation = integrationlog.validateSync()

        expect(validation.errors['licensee'].message).toEqual('Licensee: Você deve preencher o campo')
      })
    })
  })
})
