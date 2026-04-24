import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import User from '@models/User'
import { MongoServer } from './mongo.js'

describe('mongo config', () => {
  let mongoMemoryServer

  afterEach(async () => {
    await mongoose.disconnect()

    if (mongoMemoryServer) {
      await mongoMemoryServer.stop()
      mongoMemoryServer = null
    }
  })

  it('connects to mongodb and bootstraps the default user', async () => {
    mongoMemoryServer = await MongoMemoryServer.create()
    const mongoServer = new MongoServer(mongoMemoryServer.getUri())

    await mongoServer.connect()

    expect(mongoose.connection.readyState).toEqual(1)

    const defaultUser = await User.findOne({ email: process.env.DEFAULT_USER })

    expect(defaultUser).toEqual(
      expect.objectContaining({
        email: process.env.DEFAULT_USER,
        isAdmin: true,
        isSuper: true,
      }),
    )
    await expect(defaultUser.validPassword(process.env.DEFAULT_PASSWORD)).resolves.toEqual(true)
  })
})
