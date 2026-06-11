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
        create: jest
          .fn()
          .mockRejectedValue({ errors: { users: { message: 'Usuários: Informe ao menos um usuário' } } }),
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

    it('returns 500 when repository throws an unexpected error', async () => {
      const sectorRepository = {
        find: jest.fn().mockRejectedValue(new Error('connection lost')),
      }
      const controller = new SectorsController({ sectorRepository })
      const req = { query: {} }
      const res = buildResponse()

      await controller.index(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Object) }))
    })

    it('populates licensee so webhookUrl virtual resolves', async () => {
      const sectorRepository = {
        find: jest.fn().mockResolvedValue([]),
      }
      const controller = new SectorsController({ sectorRepository })
      const req = { query: { licensee: 'lic-id' } }
      const res = buildResponse()

      await controller.index(req, res)

      expect(sectorRepository.find).toHaveBeenCalledWith({ licensee: 'lic-id' }, ['licensee', 'users'])
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

    it('returns 500 when repository throws an unexpected error', async () => {
      const sectorRepository = {
        delete: jest.fn().mockRejectedValue(new Error('disk failure')),
      }
      const controller = new SectorsController({ sectorRepository })
      const req = { params: { id: 'some-id' } }
      const res = buildResponse()

      await controller.destroy(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Object) }))
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

    it('populates licensee so webhookUrl virtual resolves', async () => {
      const sectorData = { name: 'Vendas', webhookUrl: 'https://clave-digital.herokuapp.com/api/v1/messenger/message/?token=abc&sector=xyz' }
      const sectorRepository = {
        findFirst: jest.fn().mockResolvedValue(sectorData),
      }
      const controller = new SectorsController({ sectorRepository })
      const req = { params: { id: 'sector-id' } }
      const res = buildResponse()

      await controller.show(req, res)

      expect(sectorRepository.findFirst).toHaveBeenCalledWith({ _id: 'sector-id' }, ['licensee', 'users'])
      expect(res.status).toHaveBeenCalledWith(200)
    })
  })

  describe('#update', () => {
    it('returns 200 with the updated sector', async () => {
      const { controller, sectorRepository } = buildController()
      const licenseeId = 'license-id'
      const userId = 'user-id'

      const sector = await sectorRepository.create({ name: 'Vendas', licensee: licenseeId, users: [userId] })

      const req = { params: { id: sector._id }, body: { name: 'Suporte' } }
      const res = buildResponse()

      await controller.update(req, res)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ name: 'Suporte' }))
    })

    it('returns 422 when validation error occurs', async () => {
      const sectorRepository = {
        update: jest.fn().mockRejectedValue({ errors: { name: { message: 'Nome: Você deve preencher o campo' } } }),
        findFirst: jest.fn(),
      }
      const controller = new SectorsController({ sectorRepository })
      const req = { params: { id: 'some-id' }, body: { name: '' } }
      const res = buildResponse()

      await controller.update(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }))
    })
  })

  describe('#getBaileysQr', () => {
    it('returns 200 with the response from the use case', async () => {
      const { controller } = buildController()
      const qrResponse = { qr: 'data:image/png;base64,abc123' }
      controller.getBaileysQrUseCase = { execute: jest.fn().mockResolvedValue(qrResponse) }

      const req = { params: { id: 'sector-id' } }
      const res = buildResponse()

      await controller.getBaileysQr(req, res)

      expect(controller.getBaileysQrUseCase.execute).toHaveBeenCalledWith('sector-id')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith(qrResponse)
    })

    it('returns 408 on error', async () => {
      const { controller } = buildController()
      controller.getBaileysQrUseCase = { execute: jest.fn().mockRejectedValue(new Error('timeout')) }

      const req = { params: { id: 'sector-id' } }
      const res = buildResponse()

      await controller.getBaileysQr(req, res)

      expect(res.status).toHaveBeenCalledWith(408)
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Object) }))
    })
  })

  describe('#getBaileysStatus', () => {
    it('returns 200 with the response from the use case', async () => {
      const { controller } = buildController()
      const statusResponse = { status: 'connected' }
      controller.getBaileysStatusUseCase = { execute: jest.fn().mockResolvedValue(statusResponse) }

      const req = { params: { id: 'sector-id' } }
      const res = buildResponse()

      await controller.getBaileysStatus(req, res)

      expect(controller.getBaileysStatusUseCase.execute).toHaveBeenCalledWith('sector-id')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith(statusResponse)
    })

    it('returns 500 on error', async () => {
      const { controller } = buildController()
      controller.getBaileysStatusUseCase = { execute: jest.fn().mockRejectedValue(new Error('internal error')) }

      const req = { params: { id: 'sector-id' } }
      const res = buildResponse()

      await controller.getBaileysStatus(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Object) }))
    })
  })

  describe('#baileysSync', () => {
    it('returns 200 with the response from the use case', async () => {
      const { controller } = buildController()
      const syncResponse = { synced: true }
      controller.syncBaileysDirectoryUseCase = { execute: jest.fn().mockResolvedValue(syncResponse) }

      const req = { params: { id: 'sector-id' } }
      const res = buildResponse()

      await controller.baileysSync(req, res)

      expect(controller.syncBaileysDirectoryUseCase.execute).toHaveBeenCalledWith('sector-id')
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.send).toHaveBeenCalledWith(syncResponse)
    })

    it('returns 500 on error', async () => {
      const { controller } = buildController()
      controller.syncBaileysDirectoryUseCase = { execute: jest.fn().mockRejectedValue(new Error('sync failed')) }

      const req = { params: { id: 'sector-id' } }
      const res = buildResponse()

      await controller.baileysSync(req, res)

      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Object) }))
    })
  })
})
