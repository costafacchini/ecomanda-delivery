import type { ILicensee } from './licensee'

export type UserRole = 'agent' | 'supervisor' | 'admin' | 'super'

export interface IUser {
  id: string
  name: string
  email: string
  active: boolean
  role: UserRole
  licensee: Pick<ILicensee, 'id' | 'name'> | string | null
}
