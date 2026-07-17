import { Factory } from 'fishery'

const departmentFactory = Factory.define(({ sequence }) => ({
  id: String(sequence),
  name: `Departamento ${sequence}`,
  active: true,
  users: [],
}))

export { departmentFactory }
