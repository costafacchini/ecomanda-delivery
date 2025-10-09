import { Factory  } from 'fishery'
import { licensee  } from './licensee.js'

const userSuper = Factory.define(() => ({
  name: 'John Doe',
  email: 'john@doe.com',
  password: '12345678',
  active: true,
  isSuper: true,
}))

const user = Factory.define(() => ({
  name: 'Raymond Reddington',
  email: 'raymond@reddington.com',
  password: '12345678',
  active: true,
  isSuper: false,
  licensee: licensee.build(),
}))

export default { user, userSuper }
