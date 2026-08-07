import { ILicensee, IInbox, IDepartment } from './types'

declare global {
  namespace Express {
    interface Request {
      userId?: string
      licensee?: ILicensee
      inbox?: IInbox
      department?: IDepartment
    }
  }
}

export {}
