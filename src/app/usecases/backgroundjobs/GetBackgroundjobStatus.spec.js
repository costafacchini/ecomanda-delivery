import { BackgroundjobRepositoryMemory } from '@repositories/backgroundjob'
import { GetBackgroundjobStatus } from './GetBackgroundjobStatus.js'

function buildUseCase() {
  const backgroundjobRepository = new BackgroundjobRepositoryMemory()
  const getBackgroundjobStatus = new GetBackgroundjobStatus({ backgroundjobRepository })
  return { getBackgroundjobStatus, backgroundjobRepository }
}

describe('GetBackgroundjobStatus', () => {
  it('returns null when job is not found', async () => {
    const { getBackgroundjobStatus } = buildUseCase()

    const result = await getBackgroundjobStatus.execute({ jobId: 'non-existent', licenseeId: 'licensee-id' })

    expect(result).toBeNull()
  })

  it('returns scheduled message when job status is scheduled', async () => {
    const { getBackgroundjobStatus, backgroundjobRepository } = buildUseCase()
    const job = await backgroundjobRepository.create({ status: 'scheduled', licensee: 'licensee-id' })

    const result = await getBackgroundjobStatus.execute({ jobId: job._id, licenseeId: 'licensee-id' })

    expect(result).toEqual({
      message: 'O job está agendado, mas ainda não está executando. Por favor, volte mais tarde!',
    })
  })

  it('returns running message when job status is running', async () => {
    const { getBackgroundjobStatus, backgroundjobRepository } = buildUseCase()
    const job = await backgroundjobRepository.create({ status: 'running', licensee: 'licensee-id' })

    const result = await getBackgroundjobStatus.execute({ jobId: job._id, licenseeId: 'licensee-id' })

    expect(result).toEqual({
      message: 'O job está em execução, logo deve ficar pronto. Por favor, volte daqui a pouco!',
    })
  })

  it('returns done message with response when job status is done', async () => {
    const { getBackgroundjobStatus, backgroundjobRepository } = buildUseCase()
    const job = await backgroundjobRepository.create({
      status: 'done',
      licensee: 'licensee-id',
      response: { link: 'https://anything.com' },
    })

    const result = await getBackgroundjobStatus.execute({ jobId: job._id, licenseeId: 'licensee-id' })

    expect(result).toEqual({
      message: 'Eu concljuí a execução e a resposta esta na key chamada response!',
      response: { link: 'https://anything.com' },
    })
  })

  it('returns error message when job status is error', async () => {
    const { getBackgroundjobStatus, backgroundjobRepository } = buildUseCase()
    const job = await backgroundjobRepository.create({
      status: 'error',
      licensee: 'licensee-id',
      error: 'something went wrong',
    })

    const result = await getBackgroundjobStatus.execute({ jobId: job._id, licenseeId: 'licensee-id' })

    expect(result).toEqual({ message: 'something went wrong' })
  })

  it('returns null when job belongs to a different licensee', async () => {
    const { getBackgroundjobStatus, backgroundjobRepository } = buildUseCase()
    const job = await backgroundjobRepository.create({ status: 'scheduled', licensee: 'other-licensee' })

    const result = await getBackgroundjobStatus.execute({ jobId: job._id, licenseeId: 'licensee-id' })

    expect(result).toBeNull()
  })
})
