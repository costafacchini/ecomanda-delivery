import { Factory } from 'fishery'
import { licensee } from './licensee'
import { user } from './user'

const sector = Factory.define(() => ({
  active: true,
  name: 'Sector',
  users: [user.build()],
  licensee: licensee.build(),
}))

export { sector }
