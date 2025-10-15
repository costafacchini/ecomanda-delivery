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
    await mongoose.disconnect()
    const instance = global.__MONGOINSTANCE
    if (instance) {
      await instance.stop()
      global.__MONGOINSTANCE = null
    }
  }
}

export { MongoServerTest }
