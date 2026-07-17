import { Factory } from 'fishery'
import { licensee } from './licensee'
import { user } from './user'

const department = Factory.define(() => ({
  active: true,
  name: 'Department',
  users: [user.build()],
  licensee: licensee.build(),
}))

export { department }
