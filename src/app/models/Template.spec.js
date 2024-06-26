const Template = require('@models/Template')
const mongoServer = require('../../../.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { template: templateFactory } = require('@factories/template')
const { LicenseeRepositoryDatabase } = require('@repositories/licensee')

describe('Template', () => {
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
      const template = await Template.create(templateFactory.build({ licensee }))

      expect(template._id).not.toEqual(null)
    })

    it('does not changes _id if template is changed', async () => {
      const template = await Template.create(templateFactory.build({ licensee }))

      template.name = 'other'
      const alteredTemplate = await template.save()

      expect(template._id).toEqual(alteredTemplate._id)
      expect(alteredTemplate.name).toEqual('other')
    })

    it('fills the fields that have a default value', () => {
      const template = new Template()

      expect(template.active).toEqual(false)
    })
  })

  describe('validations', () => {
    describe('name', () => {
      it('is required', () => {
        const template = new Template({})
        const validation = template.validateSync()

        expect(validation.errors['name'].message).toEqual('Nome: Você deve preencher o campo')
      })
    })

    describe('namespace', () => {
      it('is required', () => {
        const template = new Template({})
        const validation = template.validateSync()

        expect(validation.errors['namespace'].message).toEqual('Namespace: Você deve preencher o campo')
      })
    })

    describe('licensee', () => {
      it('is required', () => {
        const template = new Template({ number: '7849342387' })
        const validation = template.validateSync()

        expect(validation.errors['licensee'].message).toEqual('Licensee: Você deve preencher o campo')
      })
    })
  })
})
