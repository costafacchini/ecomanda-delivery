import { GetBaileysQrForDepartment } from './GetBaileysQrForDepartment'
import { LicenseeRepositoryMemory } from '@repositories/licensee'
import { DepartmentRepositoryMemory } from '@repositories/department'
import { licenseeComplete as licenseeCompleteFactory } from '@factories/licensee'

function buildUseCase(overrides: Record<string, any> = {}) {
  const licenseeRepository = overrides.licenseeRepository ?? new LicenseeRepositoryMemory()
  const departmentRepository = overrides.departmentRepository ?? new DepartmentRepositoryMemory()
  const createMessengerPlugin = overrides.createMessengerPlugin ?? jest.fn()
  const startBaileysSocket = overrides.startBaileysSocket
  const useCase = new GetBaileysQrForDepartment({
    licenseeRepository,
    departmentRepository,
    createMessengerPlugin,
    startBaileysSocket,
  })
  return { licenseeRepository, departmentRepository, createMessengerPlugin, useCase }
}

describe('GetBaileysQrForDepartment', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    delete process.env.ENABLE_BAILEYS_SOCKET
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns { message: "Departamento não encontrado" } when department is not found', async () => {
    const { useCase } = buildUseCase()

    const result = await useCase.execute('000000000000000000000000')

    expect(result).toEqual({ message: 'Departamento não encontrado' })
  })

  it('returns { message: "Licensee não usa Baileys" } when licensee does not use baileys', async () => {
    const { licenseeRepository, departmentRepository, createMessengerPlugin, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'dialog' }))
    const department = await departmentRepository.create({ name: 'Suporte', licensee: licensee._id })

    const result = await useCase.execute(department._id)

    expect(createMessengerPlugin).not.toHaveBeenCalled()
    expect(result).toEqual({ message: 'Licensee não usa Baileys' })
  })

  it('returns { qr } when plugin.getQrCode() returns a QR string', async () => {
    const { licenseeRepository, departmentRepository, createMessengerPlugin, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const department = await departmentRepository.create({ name: 'Suporte', licensee: licensee._id })
    const plugin = { getQrCode: jest.fn().mockResolvedValue('qr-string-data') }
    createMessengerPlugin.mockReturnValue(plugin)

    const result = await useCase.execute(department._id)

    expect(createMessengerPlugin).toHaveBeenCalledWith(licensee, { department })
    expect(result).toEqual({ qr: 'qr-string-data' })
  })

  it('returns { connected: true, message: "Já conectado" } when plugin.getQrCode() returns null', async () => {
    const { licenseeRepository, departmentRepository, createMessengerPlugin, useCase } = buildUseCase()
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const department = await departmentRepository.create({ name: 'Suporte', licensee: licensee._id })
    const plugin = { getQrCode: jest.fn().mockResolvedValue(null) }
    createMessengerPlugin.mockReturnValue(plugin)

    const result = await useCase.execute(department._id)

    expect(result).toEqual({ connected: true, message: 'Já conectado' })
  })

  it('calls startBaileysSocket with licensee and department when ENABLE_BAILEYS_SOCKET is true and already connected', async () => {
    process.env.ENABLE_BAILEYS_SOCKET = 'true'
    const startBaileysSocket = jest.fn().mockResolvedValue(undefined)
    const { licenseeRepository, departmentRepository, createMessengerPlugin, useCase } = buildUseCase({
      startBaileysSocket,
    })
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const department = await departmentRepository.create({ name: 'Suporte', licensee: licensee._id })
    const plugin = { getQrCode: jest.fn().mockResolvedValue(null) }
    createMessengerPlugin.mockReturnValue(plugin)

    await useCase.execute(department._id)

    expect(startBaileysSocket).toHaveBeenCalledWith(licensee, department)
  })

  it('does not call startBaileysSocket when ENABLE_BAILEYS_SOCKET is not set', async () => {
    const startBaileysSocket = jest.fn()
    const { licenseeRepository, departmentRepository, createMessengerPlugin, useCase } = buildUseCase({
      startBaileysSocket,
    })
    const licensee = await licenseeRepository.create(licenseeCompleteFactory.build({ whatsappDefault: 'baileys' }))
    const department = await departmentRepository.create({ name: 'Suporte', licensee: licensee._id })
    const plugin = { getQrCode: jest.fn().mockResolvedValue(null) }
    createMessengerPlugin.mockReturnValue(plugin)

    await useCase.execute(department._id)

    expect(startBaileysSocket).not.toHaveBeenCalled()
  })
})
