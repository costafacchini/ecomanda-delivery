import { Factory } from 'fishery'

const sectorFactory = Factory.define(({ sequence }) => ({
  id: String(sequence),
  name: `Setor ${sequence}`,
  active: true,
  users: [],
}))

export { sectorFactory }
