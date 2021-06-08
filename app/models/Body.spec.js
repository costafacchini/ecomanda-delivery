const Body = require('@models/Body')
const Licensee = require('@models/Licensee')
const mongoServer = require('.jest/utils')

describe('Body', () => {
  beforeEach(async () => {
    await mongoServer.connect()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  describe('before save', () => {
    it('generates _id', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })

      const body = await Body.create({
        content: JSON.parse('{ "field1": 1, "field2": "text" }'),
        licensee: licensee,
      })

      expect(body._id).not.toEqual(null)
    })

    it('does not changes _id if bidy is changed', async () => {
      const licensee = await Licensee.create({ name: 'Alcateia', licenseKind: 'demo' })

      const body = await Body.create({
        content: JSON.parse('{ "field1": 1, "field2": "text" }'),
        licensee: licensee,
      })

      body.content = JSON.parse('{ "field1": 1 }')
      const alteredBody = await body.save()

      expect(body._id).toEqual(alteredBody._id)
      expect(alteredBody.content).toEqual(JSON.parse('{ "field1": 1 }'))
    })
  })

  describe('validations', () => {
    describe('content', () => {
      it('is required', () => {
        const body = new Body()
        const validation = body.validateSync()

        expect(validation.errors['content'].message).toEqual('Conteúdo: Você deve preencher o campo')
      })
    })

    describe('licensee', () => {
      it('is required', () => {
        const body = new Body()
        const validation = body.validateSync()

        expect(validation.errors['licensee'].message).toEqual('Licensee: Você deve preencher o campo')
      })
    })
  })
})
