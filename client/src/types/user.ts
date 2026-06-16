export type UserRole = 'super' | 'admin' | 'agent'

export interface IUser {
  id: string
  _id: string
  name: string
  email: string
  active: boolean
  role: UserRole
  licensee?: string | { _id: string; whatsappDefault?: string }
}

export interface IUserFilters {
  page?: number
  expression?: string
  licensee?: string
  [key: string]: unknown
}

export type IUserInput = {
  name: string
  email: string
  password?: string
  active: boolean
  role: UserRole
  licensee?: string
}
