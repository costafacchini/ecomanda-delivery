import { Factory } from 'fishery'

const userFactory =  Factory.define(({ sequence }) => ({
  id: sequence,
  name: 'Rosa',
  email: 'rosa@user.com',
  password: '123456'
}))

export {userFactory}
