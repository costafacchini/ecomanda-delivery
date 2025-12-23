import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

class MongoServerTest {
  async connect() {
    if (!global.__MONGOINSTANCE) {
      const instance = await MongoMemoryServer.create()
      global.__MONGOINSTANCE = instance
    }

    const mongoUri = global.__MONGOINSTANCE.getUri()
    await mongoose.connect(mongoUri, {})
    await mongoose.connection.db.dropDatabase()
  }

  async disconnect() {
    if (mongoose.connection.readyState !== 0) {
      try {
        await mongoose.disconnect()
        // eslint-disable-next-line no-empty
      } catch (error) {
        const ignorableErrors = ['MongoClientClosedError', 'Connection was force closed']
        if (!ignorableErrors.includes(error?.message) && !ignorableErrors.includes(error?.name)) throw error
      }
    }
    try {
      const instance = global.__MONGOINSTANCE
      if (instance) {
        await instance.stop()
        global.__MONGOINSTANCE = null
      }
      // eslint-disable-next-line no-empty
    } catch {}
  }
}

export { MongoServerTest }
