import { SectorRepositoryMemory } from '@repositories/sector'
import { SectorsController } from './SectorsController'
import Sector from '@models/Sector'
import mongoose from 'mongoose'

function buildResponse() {
  return {
    json: jest.fn(),
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

function buildController() {
  const sectorRepository = new SectorRepositoryMemory()
  sectorRepository.modelClass = Sector

  const controller = new SectorsController({ sectorRepository })

  return { controller, sectorRepository }
}

describe('SectorsController', () => {
  describe('#create', () => {
    it('returns 201 with the created sector', async () => {
      const { controller, sectorRepository } = buildController()
      const licenseeId = new mongoose.Types.ObjectId()
      const userId = new mongoose.Types.ObjectId()
      const req = { body: { name: 'Vendas', licensee: licenseeId, users: [userId] } }
      const res = buildResponse()

      await controller.create(req, res)

      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ name: 'Vendas' }))
      expect(sectorRepository.items).toHaveLength(1)
    })

    it('returns 422 when users array is empty', async () => {
      const { controller } = buildController()
      const licenseeId = new mongoose.Types.ObjectId()
      const req = { body: { name: 'Vendas', licensee: licenseeId, users: [] } }
      const res = buildResponse()

      await controller.create(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }))
    })

    it('returns 422 when name is missing', async () => {
      const { controller } = buildController()
      const licenseeId = new mongoose.Types.ObjectId()
      const userId = new mongoose.Types.ObjectId()
      const req = { body: { licensee: licenseeId, users: [userId] } }
      const res = buildResponse()

      await controller.create(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
    })
  })

  describe('#index', () => {
    it('returns all sectors filtered by licensee', async () => {
      const { controller, sectorRepository } = buildController()
      const licenseeId = new mongoose.Types.ObjectId()
      const otherLicenseeId = new mongoose.Types.ObjectId()
      const userId = new mongoose.Types.ObjectId()

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
      const licenseeId = new mongoose.Types.ObjectId()
      const userId = new mongoose.Types.ObjectId()

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
      const licenseeId = new mongoose.Types.ObjectId()
      const userId = new mongoose.Types.ObjectId()

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
      const licenseeId = new mongoose.Types.ObjectId()
      const userId = new mongoose.Types.ObjectId()

      const sector = await sectorRepository.create({ name: 'Vendas', licensee: licenseeId, users: [userId] })

      const req = { params: { id: sector._id } }
      const res = buildResponse()

      await controller.show(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ name: 'Vendas' }))
    })
  })
})
