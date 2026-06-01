import { Factory } from 'fishery'

const trafficlight = Factory.define(() => ({
  key: 'key',
  token: 'token',
  expiresAt: new Date(Date.now() + 60000),
}))

export { trafficlight }
