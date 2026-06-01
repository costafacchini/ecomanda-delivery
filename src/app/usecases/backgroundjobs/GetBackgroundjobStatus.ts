const STATUS_MESSAGES = {
  scheduled: 'O job está agendado, mas ainda não está executando. Por favor, volte mais tarde!',
  running: 'O job está em execução, logo deve ficar pronto. Por favor, volte daqui a pouco!',
  done: 'Eu concljuí a execução e a resposta esta na key chamada response!',
}

class GetBackgroundjobStatus {
  backgroundjobRepository: any

  constructor({ backgroundjobRepository }: Record<string, any> = {}) {
    this.backgroundjobRepository = backgroundjobRepository
  }

  async execute({ jobId, licenseeId }: Record<string, any> = {}) {
    const backgroundjob = await this.backgroundjobRepository.findFirst({
      _id: jobId,
      licensee: licenseeId,
    })

    if (!backgroundjob) return null

    if (backgroundjob.status === 'done') {
      return { message: STATUS_MESSAGES.done, response: backgroundjob.response }
    }

    if (backgroundjob.status === 'error') {
      return { message: backgroundjob.error }
    }

    return { message: (STATUS_MESSAGES as any)[backgroundjob.status] }
  }
}

export { GetBackgroundjobStatus }
