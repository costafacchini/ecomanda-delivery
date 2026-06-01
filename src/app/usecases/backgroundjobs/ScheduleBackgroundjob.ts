const SCHEDULE_BACKGROUND_JOB = 'background-job'

class ScheduleBackgroundjob {
  backgroundjobRepository: any
  jobQueue: any

  constructor({ backgroundjobRepository, jobQueue }: Record<string, any> = {}) {
    this.backgroundjobRepository = backgroundjobRepository
    this.jobQueue = jobQueue
  }

  async execute({ kind, payload, licenseeId }: Record<string, any> = {}) {
    const backgroundjob = await this.backgroundjobRepository.create({
      kind,
      body: payload,
      licensee: licenseeId,
    })

    await this.jobQueue.addJob(SCHEDULE_BACKGROUND_JOB, {
      jobId: backgroundjob._id.toString(),
      licenseeId,
    })

    return backgroundjob
  }
}

export { SCHEDULE_BACKGROUND_JOB, ScheduleBackgroundjob }
