const Integrationlog = require('@models/Integrationlog')
const mongoServer = require('../../../.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { integrationlog: integrationlogFactory } = require('@factories/integrationlog')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')

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
