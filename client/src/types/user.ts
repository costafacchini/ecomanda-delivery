export interface IUserLicensee {
  _id: string
  name?: string
}

export interface IUser {
  _id?: string
  id?: string
  name?: string
  email?: string
  role?: string
  licensee?: IUserLicensee
}
