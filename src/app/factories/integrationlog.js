import { Factory  } from 'fishery'
import { licensee  } from './licensee.js'

const integrationlog = Factory.define(() => ({
  log_description: 'Some integration',
  log_payload: {
    message: 'Success',
    body: {
      id: '12314',
      code: '23424',
    },
  },
  licensee: licensee.build(),
}))

export default { integrationlog }
