import Trafficlight from '@models/Trafficlight'
import mongoServer from '../../../.jest/utils'
import { trafficlight as trafficlightFactory } from '@factories/trafficlight'

describe('Trafficlight', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const trafficlight = await Trafficlight.create(trafficlightFactory.build())

      expect(trafficlight._id).not.toEqual(null)
    })

    it('does not changes _id if trafficlight is changed', async () => {
      const trafficlight = await Trafficlight.create(trafficlightFactory.build())

      trafficlight.token = 'Changed'
      const alteredtrafficlight = await trafficlight.save()

      expect(trafficlight._id).toEqual(alteredtrafficlight._id)
      expect(alteredtrafficlight.token).toEqual('Changed')
    })
  })

  describe('validations', () => {
    describe('key', () => {
      it('is required', () => {
        const trafficlight = new Trafficlight()
        const validation = trafficlight.validateSync()

        expect(validation.errors['key'].message).toEqual('Key: Você deve preencher o campo')
      })
    })

    describe('token', () => {
      it('is required', () => {
        const trafficlight = new Trafficlight()
        const validation = trafficlight.validateSync()

        expect(validation.errors['token'].message).toEqual('Token: Você deve preencher o campo')
      })
    })

    describe('expiresAt', () => {
      it('is required', () => {
        const trafficlight = new Trafficlight()
        const validation = trafficlight.validateSync()

        expect(validation.errors['expiresAt'].message).toEqual('Data de Expiração: Você deve preencher o campo')
      })
    })
  })
})
