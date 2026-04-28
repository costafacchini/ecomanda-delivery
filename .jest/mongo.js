import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

class MongoServerTest {
  async connect() {
    if (!global.__MONGOINSTANCE) {
      const instance = await MongoMemoryServer.create()
      global.__MONGOINSTANCE = instance
    }

    const mongoUri = global.__MONGOINSTANCE.getUri()

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, {})
    } else if (mongoose.connection.readyState !== 1) {
      await mongoose.disconnect()
      await mongoose.connect(mongoUri, {})
    }

    await mongoose.connection.db.dropDatabase()
  }

  async disconnect() {
    if (mongoose.connection.readyState !== 1) {
      return
    }

    await mongoose.connection.db.dropDatabase()
  }
}

export { MongoServerTest }
