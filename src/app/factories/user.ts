import { Factory } from 'fishery'
import { licensee } from './licensee'

const userSuper = Factory.define(() => ({
  name: 'John Doe',
  email: 'john@doe.com',
  password: '12345678',
  active: true,
  role: 'super',
}))

const user = Factory.define(() => ({
  name: 'Raymond Reddington',
  email: 'raymond@reddington.com',
  password: '12345678',
  active: true,
  role: 'agent',
  licensee: licensee.build(),
}))

export { user, userSuper }
