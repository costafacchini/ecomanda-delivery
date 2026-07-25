class GetBaileysQrForDepartment {
  departmentRepository: any
  licenseeRepository: any
  createMessengerPlugin: any
  startBaileysSocket: any
  getBaileysQrForInbox: any

  constructor({
    departmentRepository,
    licenseeRepository,
    createMessengerPlugin,
    startBaileysSocket,
    getBaileysQrForInbox,
  }: Record<string, any> = {}) {
    this.departmentRepository = departmentRepository
    this.licenseeRepository = licenseeRepository
    this.createMessengerPlugin = createMessengerPlugin
    this.startBaileysSocket = startBaileysSocket
    this.getBaileysQrForInbox = getBaileysQrForInbox
  }

  async execute(departmentId: any) {
    const department = await this.departmentRepository.findFirst({ _id: departmentId })
    if (!department) {
      return { message: 'Departamento não encontrado' }
    }

    if (department.inbox) {
      return this.getBaileysQrForInbox.execute(department.inbox)
    }

    const licensee = await this.licenseeRepository.findFirst({ _id: department.licensee })
    if (!licensee || licensee.whatsappDefault !== 'baileys') {
      return { message: 'Licensee não usa Baileys' }
    }

    const plugin = this.createMessengerPlugin(licensee, { department })
    const qr = await plugin.getQrCode()

    if (!qr) {
      if (process.env.ENABLE_BAILEYS_SOCKET === 'true') {
        this.startBaileysSocket?.(licensee, department).catch(() => {})
      }
      return { connected: true, message: 'Já conectado' }
    }

    return { qr }
  }
}

export { GetBaileysQrForDepartment }
