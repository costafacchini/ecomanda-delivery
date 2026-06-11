import { SectorRepositoryMemory } from '@repositories/sector'
import { SectorsController } from './SectorsController'

function buildResponse() {
  return {
    json: jest.fn(),
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

function buildController() {
  const sectorRepository = new SectorRepositoryMemory()

  const controller = new SectorsController({ sectorRepository })

  return { controller, sectorRepository }
}

describe('SectorsController', () => {
  describe('#create', () => {
    it('returns 201 with the created sector', async () => {
      const { controller, sectorRepository } = buildController()
      const licenseeId = 'license-id'
      const userId = 'user-id'
      const req = { body: { name: 'Vendas', licensee: licenseeId, users: [userId] } }
      const res = buildResponse()

      await controller.create(req, res)

      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ name: 'Vendas' }))
      expect(sectorRepository.items).toHaveLength(1)
    })

    it('returns 422 when users array is empty', async () => {
      const sectorRepository = {
        create: jest.fn().mockRejectedValue({ errors: { users: { message: 'Usuários: Informe ao menos um usuário' } } }),
      }
      const controller = new SectorsController({ sectorRepository })
      const req = { body: { name: 'Vendas', licensee: 'license-id', users: [] } }
      const res = buildResponse()

      await controller.create(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }))
    })

    it('returns 422 when name is missing', async () => {
      const sectorRepository = {
        create: jest.fn().mockRejectedValue({ errors: { name: { message: 'Nome: Você deve preencher o campo' } } }),
      }
      const controller = new SectorsController({ sectorRepository })
      const req = { body: { licensee: 'license-id', users: ['user-id'] } }
      const res = buildResponse()

      await controller.create(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
    })
  })

  describe('#index', () => {
    it('returns all sectors filtered by licensee', async () => {
      const { controller, sectorRepository } = buildController()
      const licenseeId = 'license-id'
      const otherLicenseeId = 'other-licensee-id'
      const userId = 'user-id'

      await sectorRepository.create({ name: 'Vendas', licensee: licenseeId, users: [userId] })
      await sectorRepository.create({ name: 'Suporte', licensee: otherLicenseeId, users: [userId] })

      const req = { query: { licensee: licenseeId.toString() } }
      const res = buildResponse()

      await controller.index(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      const sent = res.send.mock.calls[0][0]
      expect(sent).toHaveLength(1)
      expect(sent[0].name).toEqual('Vendas')
    })

    it('returns all sectors when no licensee filter', async () => {
      const { controller, sectorRepository } = buildController()
      const licenseeId = 'license-id'
      const userId = 'user-id'

      await sectorRepository.create({ name: 'Vendas', licensee: licenseeId, users: [userId] })
      await sectorRepository.create({ name: 'Suporte', licensee: licenseeId, users: [userId] })

      const req = { query: {} }
      const res = buildResponse()

      await controller.index(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send.mock.calls[0][0]).toHaveLength(2)
    })
  })

  describe('#destroy', () => {
    it('removes the sector and returns 204', async () => {
      const { controller, sectorRepository } = buildController()
      const licenseeId = 'license-id'
      const userId = 'user-id'

      const sector = await sectorRepository.create({ name: 'Vendas', licensee: licenseeId, users: [userId] })

      const req = { params: { id: sector._id } }
      const res = buildResponse()

      await controller.destroy(req, res)

      expect(res.status).toHaveBeenCalledWith(204)
      expect(sectorRepository.items).toHaveLength(0)
    })
  })

  describe('#show', () => {
    it('returns the sector by id', async () => {
      const { controller, sectorRepository } = buildController()
      const licenseeId = 'license-id'
      const userId = 'user-id'

      const sector = await sectorRepository.create({ name: 'Vendas', licensee: licenseeId, users: [userId] })

      const req = { params: { id: sector._id } }
      const res = buildResponse()

      await controller.show(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ name: 'Vendas' }))
    })
  })
})
