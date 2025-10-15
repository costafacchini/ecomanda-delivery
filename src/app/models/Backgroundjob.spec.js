import Backgroundjob from '@models/Backgroundjob'
import mongoServer from '../../../.jest/utils'
import { licensee as licenseeFactory } from '@factories/licensee'
import { backgroundjob as backgroundjobFactory } from '@factories/backgroundjob'
import { LicenseeRepositoryDatabase } from '@repositories/licensee'

describe('Backgroundjob', () => {
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
      const backgroundjob = await Backgroundjob.create(backgroundjobFactory.build({ licensee }))

      expect(backgroundjob._id).not.toEqual(null)
    })

    it('does not changes _id if backgroundjob is changed', async () => {
      const backgroundjob = await Backgroundjob.create(backgroundjobFactory.build({ licensee }))

      expect(backgroundjob.status).toEqual('scheduled')

      backgroundjob.status = 'running'
      const alteredBackgroundjob = await backgroundjob.save()

      expect(backgroundjob._id).toEqual(alteredBackgroundjob._id)
      expect(alteredBackgroundjob.status).toEqual('running')
    })
  })

  describe('validations', () => {
    describe('status', () => {
      it('is required', () => {
        const backgroundjob = new Backgroundjob({ status: null })
        const validation = backgroundjob.validateSync()

        expect(validation.errors['status'].message).toEqual(
          'Status: Você deve informar um valor ( scheduled | running | done | error)',
        )
      })
    })

    describe('licensee', () => {
      it('is required', () => {
        const contact = new Backgroundjob({ number: '7849342387' })
        const validation = contact.validateSync()

        expect(validation.errors['licensee'].message).toEqual('Licensee: Você deve preencher o campo')
      })
    })

    describe('kind', () => {
      it('is required', () => {
        const backgroundjob = new Backgroundjob({ kind: null })
        const validation = backgroundjob.validateSync()

        expect(validation.errors['kind'].message).toEqual(
          'Tipo do job: Você deve informar um valor ( get-pix | cancel-order | get-credit-card | invite-credit-card )',
        )
      })
    })
  })
})
