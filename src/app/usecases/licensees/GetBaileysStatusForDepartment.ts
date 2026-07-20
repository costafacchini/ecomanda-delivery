class GetBaileysStatusForDepartment {
  departmentRepository: any
  licenseeRepository: any
  whatsappSessionRepository: any
  startBaileysSocket: any
  socketManager: any
  getBaileysStatusForInbox: any

  constructor({
    departmentRepository,
    licenseeRepository,
    whatsappSessionRepository,
    startBaileysSocket,
    socketManager,
    getBaileysStatusForInbox,
  }: Record<string, any> = {}) {
    this.departmentRepository = departmentRepository
    this.licenseeRepository = licenseeRepository
    this.whatsappSessionRepository = whatsappSessionRepository
    this.startBaileysSocket = startBaileysSocket
    this.socketManager = socketManager
    this.getBaileysStatusForInbox = getBaileysStatusForInbox
  }

  async execute(departmentId: any) {
    const department = await this.departmentRepository.findFirst({ _id: departmentId })
    if (!department) {
      return { connected: false }
    }

    if (department.inbox) {
      return this.getBaileysStatusForInbox.execute(department.inbox)
    }

    const licensee = await this.licenseeRepository.findFirst({ _id: department.licensee })
    if (!licensee || licensee.whatsappDefault !== 'baileys') {
      return { connected: false }
    }

    const session = await this.whatsappSessionRepository.findFirst({
      licensee: licensee._id,
      department: department._id,
    })
    const connected = !!(session?.creds && Object.keys(session.creds).length > 0)

    if (connected && process.env.ENABLE_BAILEYS_SOCKET === 'true' && this.startBaileysSocket) {
      if (!this.socketManager?.isConnectedForLicensee(licensee._id, department._id)) {
        this.startBaileysSocket(licensee, department).catch(() => {})
      }
    }

    return { connected }
  }
}

export { GetBaileysStatusForDepartment }
