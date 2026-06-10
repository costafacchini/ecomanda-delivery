import { Factory } from 'fishery'

const setorFactory = Factory.define(({ sequence }) => ({
  id: String(sequence),
  name: `Setor ${sequence}`,
  active: true,
  users: [],
}))

export { setorFactory }
