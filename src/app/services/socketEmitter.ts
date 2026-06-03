let _io: any = null

const setIo = (io: any) => {
  _io = io
}

const emitToLicensee = (licenseeId: any, event: string, data: any) => {
  _io?.to(`licensee:${licenseeId.toString()}`).emit(event, data)
}

export { setIo, emitToLicensee }
