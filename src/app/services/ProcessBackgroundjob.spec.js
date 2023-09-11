const processBackgroundjob = require('./ProcessBackgroundjob')
const Licensee = require('@models/Licensee')
const Backgroundjob = require('@models/Backgroundjob')
const mongoServer = require('.jest/utils')
const { licensee: licenseeFactory } = require('@factories/licensee')
const { backgroundjob: backgroundjobFactory } = require('@factories/backgroundjob')

describe('processBackgroundjob', () => {
  beforeEach(async () => {
    await mongoServer.connect()
    jest.clearAllMocks()
  })

  afterEach(async () => {
    await mongoServer.disconnect()
  })

  it('responds with action with backgroundjob kind', async () => {
    const licensee = await Licensee.create(licenseeFactory.build())
    const backgroundjob = await Backgroundjob.create(
      backgroundjobFactory.build({
        kind: 'get-pix',
        body: {
          cart_id: 'cart-id',
        },
        licensee,
      })
    )

    const data = {
      jobId: backgroundjob._id,
    }

    const actions = await processBackgroundjob(data)

    expect(actions[0].action).toEqual('process-backgroundjob-get-pix')
    expect(actions[0].body).toEqual({
      cart_id: 'cart-id',
      jobId: backgroundjob._id,
    })

    expect(actions.length).toEqual(1)
  })
})
