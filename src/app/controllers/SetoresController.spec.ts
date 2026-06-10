import { SetorRepositoryMemory } from '@repositories/setor'
import { SetoresController } from './SetoresController'
import Setor from '@models/Setor'
import mongoose from 'mongoose'

function buildResponse() {
  return {
    json: jest.fn(),
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  }
}

function buildController() {
  const setorRepository = new SetorRepositoryMemory()
  setorRepository.modelClass = Setor

  const controller = new SetoresController({ setorRepository })

  return { controller, setorRepository }
}

describe('SetoresController', () => {
  describe('#create', () => {
    it('returns 201 with the created setor', async () => {
      const { controller, setorRepository } = buildController()
      const licenseeId = new mongoose.Types.ObjectId()
      const userId = new mongoose.Types.ObjectId()
      const req = { body: { name: 'Vendas', licensee: licenseeId, users: [userId] } }
      const res = buildResponse()

      await controller.create(req, res)

      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ name: 'Vendas' }))
      expect(setorRepository.items).toHaveLength(1)
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
    it('returns all setores filtered by licensee', async () => {
      const { controller, setorRepository } = buildController()
      const licenseeId = new mongoose.Types.ObjectId()
      const otherLicenseeId = new mongoose.Types.ObjectId()
      const userId = new mongoose.Types.ObjectId()

      await setorRepository.create({ name: 'Vendas', licensee: licenseeId, users: [userId] })
      await setorRepository.create({ name: 'Suporte', licensee: otherLicenseeId, users: [userId] })

      const req = { query: { licensee: licenseeId.toString() } }
      const res = buildResponse()

      await controller.index(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      const sent = res.send.mock.calls[0][0]
      expect(sent).toHaveLength(1)
      expect(sent[0].name).toEqual('Vendas')
    })

    it('returns all setores when no licensee filter', async () => {
      const { controller, setorRepository } = buildController()
      const licenseeId = new mongoose.Types.ObjectId()
      const userId = new mongoose.Types.ObjectId()

      await setorRepository.create({ name: 'Vendas', licensee: licenseeId, users: [userId] })
      await setorRepository.create({ name: 'Suporte', licensee: licenseeId, users: [userId] })

      const req = { query: {} }
      const res = buildResponse()

      await controller.index(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send.mock.calls[0][0]).toHaveLength(2)
    })
  })

  describe('#destroy', () => {
    it('removes the setor and returns 204', async () => {
      const { controller, setorRepository } = buildController()
      const licenseeId = new mongoose.Types.ObjectId()
      const userId = new mongoose.Types.ObjectId()

      const setor = await setorRepository.create({ name: 'Vendas', licensee: licenseeId, users: [userId] })

      const req = { params: { id: setor._id } }
      const res = buildResponse()

      await controller.destroy(req, res)

      expect(res.status).toHaveBeenCalledWith(204)
      expect(setorRepository.items).toHaveLength(0)
    })
  })

  describe('#show', () => {
    it('returns the setor by id', async () => {
      const { controller, setorRepository } = buildController()
      const licenseeId = new mongoose.Types.ObjectId()
      const userId = new mongoose.Types.ObjectId()

      const setor = await setorRepository.create({ name: 'Vendas', licensee: licenseeId, users: [userId] })

      const req = { params: { id: setor._id } }
      const res = buildResponse()

      await controller.show(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ name: 'Vendas' }))
    })
  })
})
